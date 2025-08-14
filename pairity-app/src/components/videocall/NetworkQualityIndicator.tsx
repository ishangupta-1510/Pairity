import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NetworkQuality } from '@/types/videocall';

interface NetworkQualityIndicatorProps {
  quality: NetworkQuality;
}

const NetworkQualityIndicator: React.FC<NetworkQualityIndicatorProps> = ({ quality }) => {
  const getQualityIcon = () => {
    switch (quality.level) {
      case 'excellent':
        return 'signal-cellular-4-bar';
      case 'good':
        return 'signal-cellular-3-bar';
      case 'fair':
        return 'signal-cellular-2-bar';
      case 'poor':
        return 'signal-cellular-1-bar';
      default:
        return 'signal-cellular-off';
    }
  };

  const getQualityColor = () => {
    switch (quality.level) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'fair':
        return '#FF9800';
      case 'poor':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <Icon name={getQualityIcon()} size={16} color={getQualityColor()} />
      <Text style={[styles.text, { color: getQualityColor() }]}>
        {quality.level}
      </Text>
      {quality.latency > 0 && (
        <Text style={styles.latency}>
          {Math.round(quality.latency)}ms
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  latency: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default NetworkQualityIndicator;