import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from './ThemeProvider';

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
  routeName: string;
  badge?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, color, routeName, badge }) => {
  const getIconName = (): string => {
    switch (routeName) {
      case 'HomeTab':
        return focused ? 'home' : 'home';
      case 'DiscoverTab':
        return focused ? 'explore' : 'explore';
      case 'MatchesTab':
        return focused ? 'favorite' : 'favorite-border';
      case 'ChatTab':
        return focused ? 'chat' : 'chat-bubble-outline';
      case 'ProfileTab':
        return focused ? 'person' : 'person-outline';
      default:
        return 'home';
    }
  };

  return (
    <View style={styles.iconContainer}>
      <Icon name={getIconName()} size={24} color={color} />
      {badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

interface CustomTabBarProps extends BottomTabBarProps {
  badges?: Record<string, number>;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  badges = {},
}) => {
  const theme = useTheme();

  const getTabLabel = (routeName: string): string => {
    switch (routeName) {
      case 'HomeTab':
        return 'Home';
      case 'DiscoverTab':
        return 'Discover';
      case 'MatchesTab':
        return 'Matches';
      case 'ChatTab':
        return 'Chat';
      case 'ProfileTab':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.colors.background }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? theme.colors.primary : theme.colors.textSecondary;
        const label = getTabLabel(route.name);
        const badge = badges[route.name];

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.tabContent,
                isFocused && { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <TabBarIcon
                focused={isFocused}
                color={color}
                size={24}
                routeName={route.name}
                badge={badge}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color },
                  isFocused && styles.tabLabelFocused,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 60,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
});

export default CustomTabBar;