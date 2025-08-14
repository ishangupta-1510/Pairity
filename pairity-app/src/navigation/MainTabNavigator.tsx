import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MainTabParamList, HomeStackParamList, DiscoverStackParamList, MatchesStackParamList, ChatStackParamList, ProfileStackParamList } from '@/types/navigation';

import { View, Text, StyleSheet } from 'react-native';
import CustomTabBar from '@/components/CustomTabBar';
import CustomHeader from '@/components/CustomHeader';

// Import screens
import HomeScreen from '@/screens/main/HomeScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import SettingsScreen from '@/screens/main/SettingsScreen';
import DiscoverScreen from '@/screens/discover/DiscoverScreen';
import ChatListScreen from '@/screens/chat/ChatListScreen';
import ChatScreen from '@/screens/chat/ChatScreen';
import MatchesScreen from '@/screens/matches/MatchesScreen';

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

// Home Stack
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </HomeStack.Navigator>
);

// Discover Stack
const DiscoverStack = createNativeStackNavigator<DiscoverStackParamList>();
const DiscoverStackNavigator: React.FC = () => (
  <DiscoverStack.Navigator>
    <DiscoverStack.Screen 
      name="Discover" 
      component={DiscoverScreen}
      options={{ headerShown: false }}
    />
  </DiscoverStack.Navigator>
);

// Matches Stack
const MatchesStack = createNativeStackNavigator<MatchesStackParamList>();
const MatchesStackNavigator: React.FC = () => (
  <MatchesStack.Navigator>
    <MatchesStack.Screen 
      name="Matches" 
      component={MatchesScreen}
      options={{ headerShown: false }}
    />
  </MatchesStack.Navigator>
);

// Chat Stack
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ChatStackNavigator: React.FC = () => (
  <ChatStack.Navigator>
    <ChatStack.Screen 
      name="ChatList" 
      component={ChatListScreen}
      options={{ headerShown: false }}
    />
    <ChatStack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{ headerShown: false }}
    />
  </ChatStack.Navigator>
);

// Profile Stack
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

// Main Tab Navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} badges={{ ChatTab: 3, MatchesTab: 1 }} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'DiscoverTab':
              iconName = 'explore';
              break;
            case 'MatchesTab':
              iconName = 'favorite';
              break;
            case 'ChatTab':
              iconName = 'chat';
              break;
            case 'ProfileTab':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="DiscoverTab" 
        component={DiscoverStackNavigator}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen 
        name="MatchesTab" 
        component={MatchesStackNavigator}
        options={{ tabBarLabel: 'Matches' }}
      />
      <Tab.Screen 
        name="ChatTab" 
        component={ChatStackNavigator}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default MainTabNavigator;