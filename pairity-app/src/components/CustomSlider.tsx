import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Vibration,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomSliderProps {
  label: string;
  value: number | [number, number];
  onValueChange: (value: number | [number, number]) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  unit?: string;
  icon?: string;
  isDualSlider?: boolean;
  showValue?: boolean;
  color?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  unit = '',
  icon,
  isDualSlider = false,
  showValue = true,
  color = '#FF6B6B',
}) => {
  const [isSliding, setIsSliding] = useState(false);
  const lastHapticValue = useRef<number>(0);

  const handleValueChange = (newValue: number, index?: number) => {
    // Haptic feedback at every 10% change
    const hapticStep = (maximumValue - minimumValue) / 10;
    if (Math.abs(newValue - lastHapticValue.current) >= hapticStep) {
      if (Platform.OS === 'ios') {
        Vibration.vibrate(1);
      }
      lastHapticValue.current = newValue;
    }

    if (isDualSlider && typeof value === 'object') {
      const newRange = [...value] as [number, number];
      if (index === 0) {
        newRange[0] = Math.min(newValue, value[1] - 1);
      } else {
        newRange[1] = Math.max(newValue, value[0] + 1);
      }
      onValueChange(newRange);
    } else {
      onValueChange(newValue);
    }
  };

  const formatValue = () => {
    if (isDualSlider && typeof value === 'object') {
      return `${value[0]} - ${value[1]} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {icon && <Icon name={icon} size={20} color="#666" style={styles.icon} />}
          <Text style={styles.label}>{label}</Text>
        </View>
        {showValue && <Text style={styles.value}>{formatValue()}</Text>}
      </View>

      {isDualSlider && typeof value === 'object' ? (
        <View style={styles.dualSliderContainer}>
          <Text style={styles.rangeLabel}>{minimumValue}</Text>
          <View style={styles.sliderWrapper}>
            <Slider
              style={[styles.slider, styles.sliderBottom]}
              minimumValue={minimumValue}
              maximumValue={maximumValue}
              step={step}
              value={value[0]}
              onValueChange={(val) => handleValueChange(val, 0)}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
              minimumTrackTintColor={color}
              maximumTrackTintColor="#ddd"
              thumbTintColor={color}
            />
            <Slider
              style={[styles.slider, styles.sliderTop]}
              minimumValue={minimumValue}
              maximumValue={maximumValue}
              step={step}
              value={value[1]}
              onValueChange={(val) => handleValueChange(val, 1)}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="#ddd"
              thumbTintColor={color}
            />
          </View>
          <Text style={styles.rangeLabel}>{maximumValue}</Text>
        </View>
      ) : (
        <View style={styles.singleSliderContainer}>
          <Text style={styles.rangeLabel}>{minimumValue}</Text>
          <Slider
            style={styles.slider}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
            step={step}
            value={value as number}
            onValueChange={handleValueChange}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={() => setIsSliding(false)}
            minimumTrackTintColor={color}
            maximumTrackTintColor="#ddd"
            thumbTintColor={color}
          />
          <Text style={styles.rangeLabel}>{maximumValue}</Text>
        </View>
      )}

      {isSliding && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{formatValue()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  singleSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dualSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderWrapper: {
    flex: 1,
    height: 40,
    position: 'relative',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sliderTop: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#999',
    minWidth: 30,
    textAlign: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CustomSlider;