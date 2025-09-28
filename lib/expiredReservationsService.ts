import { db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export class ExpiredReservationsService {
  static async removeExpiredReservations(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('date', '<', today.toISOString().split('T')[0]));
      
      const querySnapshot = await getDocs(q);
      const expiredCount = querySnapshot.size;
      
      // Delete expired reservations
      const deletePromises = querySnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'bookings', docSnapshot.id))
      );
      
      await Promise.all(deletePromises);
      
      console.log(`🗑️ Removed ${expiredCount} expired reservations`);
      return expiredCount;
    } catch (error) {
      console.error('Error removing expired reservations:', error);
      return 0;
    }
  }

  static async scheduleExpiredReservationsCleanup(): Promise<void> {
    // Run cleanup every hour
    setInterval(async () => {
      await this.removeExpiredReservations();
    }, 60 * 60 * 1000); // 1 hour

    // Run cleanup immediately
    await this.removeExpiredReservations();
  }
}
