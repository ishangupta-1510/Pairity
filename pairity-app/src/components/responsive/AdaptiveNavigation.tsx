import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigationLayout, useDeviceInfo, useIsLandscape } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface NavigationItem {
  name: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
  badge?: number;
}

interface AdaptiveNavigationProps {
  items: NavigationItem[];
  initialRoute?: string;
}

const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const AdaptiveNavigation: React.FC<AdaptiveNavigationProps> = ({
  items,
  initialRoute,
}) => {
  const theme = useTheme();
  const deviceInfo = useDeviceInfo();
  const isLandscape = useIsLandscape();
  const navLayout = useNavigationLayout();

  // Sidebar navigation for tablets in landscape
  if (navLayout.type === 'sidebar' && deviceInfo.isTablet && isLandscape) {
    return (
      <SidebarNavigation
        items={items}
        initialRoute={initialRoute}
        theme={theme}
      />
    );
  }

  // Top tabs for tablets in portrait
  if (navLayout.type === 'top' && deviceInfo.isTablet && !isLandscape) {
    return (
      <TopTab.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: navLayout.height,
          },
          tabBarLabelStyle: {
            fontSize: moderateScale(14),
            fontWeight: '600',
          },
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
            height: 3,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarScrollEnabled: items.length > 4,
        }}
      >
        {items.map((item) => (
          <TopTab.Screen
            key={item.name}
            name={item.name}
            component={item.component}
            options={{
              tabBarLabel: item.label,
              tabBarIcon: ({ color }) => (
                <Icon name={item.icon} size={20} color={color} />
              ),
              tabBarBadge: item.badge ? () => (
                <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : undefined,
            }}
          />
        ))}
      </TopTab.Navigator>
    );
  }

  // Bottom tabs for phones (default)
  return (
    <BottomTab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          height: navLayout.height,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(12),
          fontWeight: '500',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
      }}
    >
      {items.map((item) => (
        <BottomTab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
          options={{
            tabBarLabel: item.label,
            tabBarIcon: ({ color, size }) => (
              <Icon name={item.icon} size={size} color={color} />
            ),
            tabBarBadge: item.badge || undefined,
          }}
        />
      ))}
    </BottomTab.Navigator>
  );
};

// Sidebar navigation component for tablets
const SidebarNavigation: React.FC<{
  items: NavigationItem[];
  initialRoute?: string;
  theme: any;
}> = ({ items, initialRoute, theme }) => {
  const [selectedRoute, setSelectedRoute] = React.useState(initialRoute || items[0].name);
  const SelectedComponent = items.find(item => item.name === selectedRoute)?.component;

  return (
    <View style={styles.sidebarContainer}>
      <ScrollView
        style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sidebarHeader}>
          <Text style={[styles.sidebarTitle, { color: theme.colors.text }]}>
            Pairity
          </Text>
        </View>
        
        {items.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.sidebarItem,
              selectedRoute === item.name && {
                backgroundColor: theme.colors.primaryLight + '20',
              },
            ]}
            onPress={() => setSelectedRoute(item.name)}
          >
            <Icon
              name={item.icon}
              size={24}
              color={selectedRoute === item.name ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.sidebarItemText,
                {
                  color: selectedRoute === item.name ? theme.colors.primary : theme.colors.text,
                  fontWeight: selectedRoute === item.name ? '600' : '400',
                },
              ]}
            >
              {item.label}
            </Text>
            {item.badge && (
              <View style={[styles.sidebarBadge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.sidebarBadgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.sidebarContent}>
        {SelectedComponent && <SelectedComponent />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  sidebarHeader: {
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sidebarTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    marginHorizontal: moderateScale(8),
    marginVertical: moderateScale(2),
    borderRadius: moderateScale(8),
  },
  sidebarItemText: {
    fontSize: moderateScale(16),
    marginLeft: moderateScale(12),
    flex: 1,
  },
  sidebarBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(10),
    minWidth: moderateScale(20),
    alignItems: 'center',
  },
  sidebarBadgeText: {
    color: 'white',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  sidebarContent: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AdaptiveNavigation;