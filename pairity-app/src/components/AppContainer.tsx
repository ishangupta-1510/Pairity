import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { ThemeProvider } from './ThemeProvider';
import RootNavigator from '@/navigation/RootNavigator';
import ErrorBoundary from './ErrorBoundary';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { loadStoredAuth } from '@/store/slices/authSlice';

// App content component that uses Redux
const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load stored authentication on app start
    dispatch(loadStoredAuth() as any);
  }, [dispatch]);

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </ThemeProvider>
  );
};

// Main App component
const AppContainer: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<Loading text="Loading app..." />} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default AppContainer;