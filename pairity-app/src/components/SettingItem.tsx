import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SettingItemProps {
  icon?: string;
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
  onPress?: () => void;
  badge?: string;
  badgeColor?: string;
  verified?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  rightComponent,
  showArrow = false,
  onPress,
  badge,
  badgeColor = '#FF6B6B',
  verified = false,
  disabled = false,
  style,
}) => {
  const content = (
    <View style={[styles.container, disabled && styles.disabled, style]}>
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={24} color={disabled ? '#ccc' : '#666'} />
          </View>
        )}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, disabled && styles.disabledText]}>
              {title}
            </Text>
            {verified && (
              <Icon
                name="verified"
                size={16}
                color="#339AF0"
                style={styles.verifiedIcon}
              />
            )}
            {badge && (
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={[styles.subtitle, disabled && styles.disabledText]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        {rightComponent}
        {showArrow && (
          <Icon
            name="chevron-right"
            size={24}
            color={disabled ? '#ddd' : '#ccc'}
            style={styles.arrow}
          />
        )}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  disabled: {
    opacity: 0.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    marginLeft: 8,
  },
});

export default SettingItem;