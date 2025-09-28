import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationService } from '../services/notificationService';

export default function NotificationSettingsScreen() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState({
    bookingConfirmations: true,
    reminders: true,
    stadiumAvailability: false,
    friendlyMatches: false,
  });

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const testNotification = async () => {
    try {
      await NotificationService.sendBookingConfirmation({
        stadium: 'Test Stadium',
        date: '2024-01-01',
        time: '10:00',
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Booking Confirmations</Text>
          <Switch
            value={notifications.bookingConfirmations}
            onValueChange={() => toggleNotification('bookingConfirmations')}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Reminders</Text>
          <Switch
            value={notifications.reminders}
            onValueChange={() => toggleNotification('reminders')}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Stadium Availability</Text>
          <Switch
            value={notifications.stadiumAvailability}
            onValueChange={() => toggleNotification('stadiumAvailability')}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Friendly Matches</Text>
          <Switch
            value={notifications.friendlyMatches}
            onValueChange={() => toggleNotification('friendlyMatches')}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Text style={styles.testButtonText}>Test Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 20,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});