import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SplashScreen from './src/screens/SplashScreen';
import NetworkErrorScreen from './src/screens/NetworkErrorScreen';
import UserTabs from './src/navigation/UserTabs';
import AdminTabs from './src/navigation/AdminTabs';
import LoadingScreen from './src/screens/LoadingScreen';
import { NetworkService } from './src/services/networkService';
import { ExpiredReservationsService } from './src/services/expiredReservationsService';

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();
  const [isNetworkConnected, setIsNetworkConnected] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    // Initialize expired reservations cleanup
    ExpiredReservationsService.scheduleExpiredReservationsCleanup();
  }, []);

  useEffect(() => {
    // Check network connection
    const checkNetwork = async () => {
      const connected = await NetworkService.isConnected();
      setIsNetworkConnected(connected);
    };

    checkNetwork();

    // Listen for network changes
    const unsubscribe = NetworkService.addConnectionListener((connected) => {
      setIsNetworkConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show network error if no connection
  if (!isNetworkConnected) {
    return (
      <NetworkErrorScreen 
        onRetry={() => {
          NetworkService.isConnected().then(setIsNetworkConnected);
        }} 
      />
    );
  }

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === 'admin' ? (
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
          ) : (
            <Stack.Screen name="UserTabs" component={UserTabs} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <AppContent />
        </View>
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});