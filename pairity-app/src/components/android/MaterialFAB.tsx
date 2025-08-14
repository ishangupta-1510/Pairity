import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface MaterialFABProps {
  icon: string;
  onPress: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'regular' | 'large' | 'extended';
  color?: string;
  visible?: boolean;
  animated?: boolean;
  elevation?: number;
  actions?: FABAction[];
}

interface FABAction {
  icon: string;
  label?: string;
  onPress: () => void;
  color?: string;
}

const MaterialFAB: React.FC<MaterialFABProps> = ({
  icon,
  onPress,
  label,
  position = 'bottom-right',
  size = 'regular',
  color,
  visible = true,
  animated = true,
  elevation = 6,
  actions,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible, animated]);

  const handlePress = () => {
    if (actions && actions.length > 0) {
      toggleActions();
    } else {
      onPress();
    }
  };

  const toggleActions = () => {
    const toValue = expanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
    ]).start();

    setExpanded(!expanded);
  };

  const getFABSize = () => {
    switch (size) {
      case 'small':
        return moderateScale(40);
      case 'large':
        return moderateScale(72);
      case 'extended':
        return { width: 'auto', height: moderateScale(48) };
      default:
        return moderateScale(56);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return moderateScale(18);
      case 'large':
        return moderateScale(32);
      default:
        return moderateScale(24);
    }
  };

  const getPosition = () => {
    const base = {
      position: 'absolute' as const,
      bottom: moderateScale(16),
    };

    switch (position) {
      case 'bottom-left':
        return { ...base, left: moderateScale(16) };
      case 'bottom-center':
        return { ...base, alignSelf: 'center' };
      default:
        return { ...base, right: moderateScale(16) };
    }
  };

  const fabSize = getFABSize();
  const iconSize = getIconSize();
  const fabColor = color || theme.colors.primary;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Speed dial actions */}
      {actions && expanded && (
        <View style={[styles.actionsContainer, getPosition()]}>
          {actions.map((action, index) => (
            <Animated.View
              key={index}
              style={[
                styles.actionItem,
                {
                  opacity: rotateAnim,
                  transform: [
                    {
                      translateY: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -(index + 1) * moderateScale(60)],
                      }),
                    },
                  ],
                },
              ]}
            >
              {action.label && (
                <View style={[styles.actionLabel, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.actionLabelText, { color: theme.colors.text }]}>
                    {action.label}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: action.color || theme.colors.surface,
                    width: moderateScale(40),
                    height: moderateScale(40),
                  },
                ]}
                onPress={() => {
                  action.onPress();
                  toggleActions();
                }}
                activeOpacity={0.8}
              >
                <Icon 
                  name={action.icon} 
                  size={moderateScale(20)} 
                  color={action.color ? '#fff' : theme.colors.text} 
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Main FAB */}
      <Animated.View
        style={[
          styles.container,
          getPosition(),
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: fabColor,
              elevation: Platform.OS === 'android' ? elevation : 0,
              ...(typeof fabSize === 'object' ? fabSize : { width: fabSize, height: fabSize }),
            },
            Platform.OS === 'ios' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: elevation / 2 },
              shadowOpacity: 0.24,
              shadowRadius: elevation / 2,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [{ rotate: actions ? spin : '0deg' }],
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name={actions && expanded ? 'close' : icon} size={iconSize} color="#fff" />
            {label && size === 'extended' && (
              <Text style={[styles.label, { marginLeft: moderateScale(8) }]}>
                {label}
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  fab: {
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
  },
  label: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  },
  actionsContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 998,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  actionButton: {
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionLabel: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(12),
    elevation: 2,
  },
  actionLabelText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
});

export default MaterialFAB;