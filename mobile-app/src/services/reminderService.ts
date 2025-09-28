import * as Notifications from 'expo-notifications';
import { NotificationService } from './notificationService';

export class ReminderService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  static startReminderService() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check for reminders every 5 minutes
    this.intervalId = setInterval(async () => {
      await this.checkUpcomingReservations();
    }, 5 * 60 * 1000); // 5 minutes

    // Also check immediately when starting
    this.checkUpcomingReservations();
  }

  static stopReminderService() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private static async checkUpcomingReservations() {
    try {
      // Get current time
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Get today's date in YYYY-MM-DD format
      const today = now.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Check for reservations starting in the next hour
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      // This would typically fetch from your API or local storage
      // For now, we'll simulate with mock data
      const upcomingReservations = await this.getUpcomingReservations(today, tomorrowStr, oneHourFromNow);
      
      for (const reservation of upcomingReservations) {
        await this.sendReminderIfNeeded(reservation);
      }
    } catch (error) {
      console.error('Error checking upcoming reservations:', error);
    }
  }

  private static async getUpcomingReservations(today: string, tomorrow: string, oneHourFromNow: Date) {
    // In a real app, this would fetch from your API
    // For now, return mock data for demonstration
    const mockReservations = [
      {
        id: '1',
        stadium: 'Stadium A',
        date: today,
        time: '14:00',
        userId: 'current-user',
        reminderSent: false
      },
      {
        id: '2',
        stadium: 'Stadium B',
        date: tomorrow,
        time: '10:00',
        userId: 'current-user',
        reminderSent: false
      }
    ];

    // Filter reservations that are coming up
    return mockReservations.filter(reservation => {
      const reservationDateTime = new Date(`${reservation.date}T${reservation.time}:00`);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      return reservationDateTime > now && 
             reservationDateTime <= oneHourFromNow && 
             !reservation.reminderSent;
    });
  }

  private static async sendReminderIfNeeded(reservation: any) {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.time}:00`);
    const now = new Date();
    const timeUntilReservation = reservationDateTime.getTime() - now.getTime();
    
    // Send reminder if reservation is within the next hour
    if (timeUntilReservation > 0 && timeUntilReservation <= 60 * 60 * 1000) {
      const minutesUntil = Math.floor(timeUntilReservation / (1000 * 60));
      
      let message = '';
      if (minutesUntil <= 15) {
        message = `Your reservation at ${reservation.stadium} starts in ${minutesUntil} minutes!`;
      } else if (minutesUntil <= 30) {
        message = `Your reservation at ${reservation.stadium} starts in ${minutesUntil} minutes. Get ready!`;
      } else {
        message = `Reminder: You have a reservation at ${reservation.stadium} in ${minutesUntil} minutes.`;
      }

      await NotificationService.schedulePushNotification(
        'Reservation Reminder ⏰',
        message,
        {
          type: 'reservation_reminder',
          reservationId: reservation.id,
          stadium: reservation.stadium,
          date: reservation.date,
          time: reservation.time
        }
      );

      // Mark as reminder sent (in real app, update in database)
      reservation.reminderSent = true;
    }
  }

  // Method to schedule a specific reminder
  static async scheduleReservationReminder(reservation: {
    id: string;
    stadium: string;
    date: string;
    time: string;
  }) {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.time}:00`);
    const now = new Date();
    
    // Schedule reminder for 1 hour before
    const reminderTime = new Date(reservationDateTime.getTime() - 60 * 60 * 1000);
    
    if (reminderTime > now) {
      const triggerTime = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reservation Reminder ⏰',
          body: `Your reservation at ${reservation.stadium} starts in 1 hour!`,
          data: {
            type: 'reservation_reminder',
            reservationId: reservation.id,
            stadium: reservation.stadium,
            date: reservation.date,
            time: reservation.time
          },
        },
        trigger: { seconds: triggerTime },
      });

      // Schedule reminder for 15 minutes before
      const reminderTime15 = new Date(reservationDateTime.getTime() - 15 * 60 * 1000);
      if (reminderTime15 > now) {
        const triggerTime15 = Math.floor((reminderTime15.getTime() - now.getTime()) / 1000);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Reservation Starting Soon! 🏃‍♂️',
            body: `Your reservation at ${reservation.stadium} starts in 15 minutes!`,
            data: {
              type: 'reservation_reminder',
              reservationId: reservation.id,
              stadium: reservation.stadium,
              date: reservation.date,
              time: reservation.time
            },
          },
          trigger: { seconds: triggerTime15 },
        });
      }
    }
  }
}
