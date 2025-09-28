import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { API_ENDPOINTS, apiCall } from '../config/api';

export default function TestConnectionScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing...');
    
    try {
      const response = await apiCall(API_ENDPOINTS.PING);
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('✅ Connected successfully!');
        Alert.alert('Success', 'API connection is working!');
      } else {
        setConnectionStatus('❌ Connection failed');
        Alert.alert('Error', `Connection failed: ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus('❌ Connection error');
      Alert.alert('Error', `Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      <Text style={styles.status}>{connectionStatus}</Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.info}>
        This will test the connection to your web API server.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
