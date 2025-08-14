import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { RootStackParamList } from '@/types/navigation';
import LinkingConfiguration from './LinkingConfiguration';

// Import navigators
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import Loading from '@/components/Loading';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <Loading text="Loading..." />;
  }

  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
        <Stack.Screen 
          name="Loading" 
          component={() => <Loading text="Please wait..." />}
          options={{ 
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;