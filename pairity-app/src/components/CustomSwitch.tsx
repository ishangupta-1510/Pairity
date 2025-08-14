import React, { useEffect, useRef } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  activeColor = '#FF6B6B',
  inactiveColor = '#ddd',
  thumbColor = '#fff',
}) => {
  const translateX = useRef(new Animated.Value(value ? 22 : 2)).current;
  const backgroundColorAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 22 : 2,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(backgroundColorAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const scale = translateX.interpolate({
    inputRange: [2, 11, 22],
    outputRange: [1, 1.1, 1],
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor },
          disabled && styles.disabled,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbColor,
              transform: [{ translateX }, { scale }],
            },
            disabled && styles.thumbDisabled,
          ]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  thumbDisabled: {
    backgroundColor: '#f5f5f5',
  },
});

export default CustomSwitch;