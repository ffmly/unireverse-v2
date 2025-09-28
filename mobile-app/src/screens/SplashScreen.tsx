import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const SplashScreen: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    // Splash screen will automatically navigate based on auth state
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/splash.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        
      </View>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F7A7D" />
        <Text style={styles.loadingText}>{t('splash.loading')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5F9EA0', // Muted teal-green background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },

  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#2F7A7D',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default SplashScreen;
