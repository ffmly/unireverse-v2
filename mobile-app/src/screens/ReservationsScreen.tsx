import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS, apiCall } from '../config/api';

interface Reservation {
  id: string;
  user_id: string;
  stadium_id: string;
  date: string;
  time_slot_id: string;
  stadiums?: {
    name?: string;
    sport_id?: string;
  };
  time_slots?: {
    time?: string;
    period?: string;
  };
}

export default function ReservationsScreen() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const response = await apiCall(`${API_ENDPOINTS.BOOKINGS}?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancel = async (reservationId: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await apiCall(`${API_ENDPOINTS.BOOKINGS}/${reservationId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setReservations(reservations.filter(r => r.id !== reservationId));
                Alert.alert('Success', 'Reservation cancelled successfully');
              } else {
                throw new Error('Failed to cancel reservation');
              }
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <View style={styles.reservationCard}>
      <View style={styles.reservationHeader}>
        <Text style={styles.stadiumName}>
          {item.stadiums?.name || 'Unknown Stadium'}
        </Text>
        <Text style={styles.sport}>
          {item.stadiums?.sport_id || 'Unknown Sport'}
        </Text>
      </View>
      <View style={styles.reservationDetails}>
        <Text style={styles.detailText}>Date: {item.date}</Text>
        <Text style={styles.detailText}>Time: {item.time_slots?.time || 'Unknown Time'}</Text>
        <Text style={[styles.status, { color: '#4CAF50' }]}>
          Confirmed
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancel(item.id)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reservations</Text>
        <Text style={styles.subtitle}>Manage your bookings</Text>
      </View>
      
      <FlatList
        data={reservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reservations found</Text>
            <Text style={styles.emptySubtext}>Book a stadium to see your reservations here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  reservationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stadiumName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sport: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reservationDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
