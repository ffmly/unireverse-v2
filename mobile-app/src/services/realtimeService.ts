import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export class RealtimeService {
  static subscribeToBookings(userId: string, callback: (bookings: any[]) => void) {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('user_id', '==', userId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(bookings);
    });
  }

  static subscribeToAllBookings(callback: (bookings: any[]) => void) {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(bookings);
    });
  }

  static subscribeToStadiums(callback: (stadiums: any[]) => void) {
    const stadiumsRef = collection(db, 'stadiums');
    const q = query(stadiumsRef, orderBy('name'));

    return onSnapshot(q, (snapshot) => {
      const stadiums = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(stadiums);
    });
  }

  static subscribeToTimeSlots(callback: (timeSlots: any[]) => void) {
    const timeSlotsRef = collection(db, 'timeSlots');
    const q = query(timeSlotsRef, orderBy('time'));

    return onSnapshot(q, (snapshot) => {
      const timeSlots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(timeSlots);
    });
  }

  static subscribeToFriendlyMatches(callback: (matches: any[]) => void) {
    const matchesRef = collection(db, 'friendlyMatches');
    const q = query(matchesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(matches);
    });
  }
}
