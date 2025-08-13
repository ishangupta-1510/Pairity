import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, ActivityIndicator, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { store, persistor } from './src/store/store';
import AuthNavigator from './src/navigation/AuthNavigator';
import { Colors } from './src/styles/colors';

// Loading component
const LoadingView = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryBlack }}>
    <ActivityIndicator size="large" color={Colors.royalGold} />
  </View>
);

// Toast configuration
const toastConfig = {
  success: (props) => (
    <View style={{
      backgroundColor: Colors.emeraldGreen,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 20,
    }}>
      <Text style={{ color: Colors.textPrimary }}>{props.text1}</Text>
    </View>
  ),
  error: (props) => (
    <View style={{
      backgroundColor: Colors.rubyRed,
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 20,
    }}>
      <Text style={{ color: Colors.textPrimary }}>{props.text1}</Text>
    </View>
  ),
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={Colors.primaryBlack} />
          <AuthNavigator />
          <Toast config={toastConfig} />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}