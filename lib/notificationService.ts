// Web notification service for browser notifications
export class WebNotificationService {
  private static permissionGranted = false;

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  static async sendNotification(title: string, options?: NotificationOptions) {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return;
      }
    }

    if (document.visibilityState === 'visible') {
      // Only show notification if tab is not active
      return;
    }

    const notification = new Notification(title, {
      icon: '/placeholder-logo.png',
      badge: '/placeholder-logo.png',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  static async sendBookingConfirmation(bookingDetails: {
    stadium: string;
    date: string;
    time: string;
  }) {
    await this.sendNotification('Booking Confirmed! 🎉', {
      body: `Your booking for ${bookingDetails.stadium} on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed.`,
      tag: 'booking-confirmation',
      data: { type: 'booking_confirmation', ...bookingDetails }
    });
  }

  static async sendBookingReminder(bookingDetails: {
    stadium: string;
    date: string;
    time: string;
  }) {
    await this.sendNotification('Upcoming Booking ⏰', {
      body: `Don't forget! You have a booking at ${bookingDetails.stadium} tomorrow at ${bookingDetails.time}.`,
      tag: 'booking-reminder',
      data: { type: 'booking_reminder', ...bookingDetails }
    });
  }

  static async sendStadiumAvailable(stadiumName: string) {
    await this.sendNotification('Stadium Available! 🏟️', {
      body: `${stadiumName} is now available for booking. Book it quickly!`,
      tag: 'stadium-available',
      data: { type: 'stadium_available', stadium: stadiumName }
    });
  }

  static async sendFriendlyMatchInvite(matchDetails: {
    hostClub: string;
    sport: string;
    date: string;
    time: string;
  }) {
    await this.sendNotification('New Friendly Match! ⚽', {
      body: `${matchDetails.hostClub} is organizing a ${matchDetails.sport} match on ${matchDetails.date} at ${matchDetails.time}. Join now!`,
      tag: 'friendly-match',
      data: { type: 'friendly_match', ...matchDetails }
    });
  }

  static async sendReservationReminder(bookingDetails: {
    stadium: string;
    date: string;
    time: string;
    minutesUntil: number;
  }) {
    let message = '';
    if (bookingDetails.minutesUntil <= 15) {
      message = `Your reservation at ${bookingDetails.stadium} starts in ${bookingDetails.minutesUntil} minutes!`;
    } else if (bookingDetails.minutesUntil <= 30) {
      message = `Your reservation at ${bookingDetails.stadium} starts in ${bookingDetails.minutesUntil} minutes. Get ready!`;
    } else {
      message = `Reminder: You have a reservation at ${bookingDetails.stadium} in ${bookingDetails.minutesUntil} minutes.`;
    }

    await this.sendNotification('Reservation Reminder ⏰', {
      body: message,
      tag: 'reservation-reminder',
      data: { type: 'reservation_reminder', ...bookingDetails }
    });
  }
}
