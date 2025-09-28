import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkService } from '../services/networkService';

interface NetworkErrorScreenProps {
  onRetry: () => void;
}

const NetworkErrorScreen: React.FC<NetworkErrorScreenProps> = ({ onRetry }) => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await NetworkService.isConnected();
      setIsConnected(connected);
    };

    checkConnection();

    const unsubscribe = NetworkService.addConnectionListener((connected) => {
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/splash.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>There is No connection</Text>
        <Text style={styles.message}>Verify connection</Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isConnected ? t('network.connected') : t('network.disconnected')}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.retryButton, !isConnected && styles.retryButtonDisabled]} 
          onPress={onRetry}
          disabled={!isConnected}
        >
          <Text style={styles.retryButtonText}>{t('network.retry')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5F9EA0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#E8F4F8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#2F7A7D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  retryButtonDisabled: {
    backgroundColor: '#7A9B9C',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NetworkErrorScreen;
