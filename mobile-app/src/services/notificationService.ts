import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async registerForPushNotificationsAsync() {
    let token;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.warn('Push notification permission not granted. Notifications will not work.');
          return null;
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        
        console.log('Push notification token:', token);
      } else {
        console.warn('Must use physical device for Push Notifications. Running in simulator.');
        return null;
      }
    } catch (error) {
      console.warn('Push notifications not available in Expo Go:', error);
      return null;
    }

    return token;
  }

  static async schedulePushNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
    }
  }

  static async sendBookingConfirmation(bookingDetails: {
    stadium: string;
    date: string;
    time: string;
  }) {
    await this.schedulePushNotification(
      'Booking Confirmed! 🎉',
      `Your booking for ${bookingDetails.stadium} on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed.`,
      { type: 'booking_confirmation', ...bookingDetails }
    );
  }

  static async sendBookingReminder(bookingDetails: {
    stadium: string;
    date: string;
    time: string;
  }) {
    await this.schedulePushNotification(
      'Upcoming Booking ⏰',
      `Don't forget! You have a booking at ${bookingDetails.stadium} tomorrow at ${bookingDetails.time}.`,
      { type: 'booking_reminder', ...bookingDetails }
    );
  }

  static async sendStadiumAvailable(stadiumName: string) {
    await this.schedulePushNotification(
      'Stadium Available! 🏟️',
      `${stadiumName} is now available for booking. Book it quickly!`,
      { type: 'stadium_available', stadium: stadiumName }
    );
  }

  static async sendFriendlyMatchInvite(matchDetails: {
    hostClub: string;
    sport: string;
    date: string;
    time: string;
  }) {
    await this.schedulePushNotification(
      'New Friendly Match! ⚽',
      `${matchDetails.hostClub} is organizing a ${matchDetails.sport} match on ${matchDetails.date} at ${matchDetails.time}. Join now!`,
      { type: 'friendly_match', ...matchDetails }
    );
  }

  static addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}
