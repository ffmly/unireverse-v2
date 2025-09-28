import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  user?: {
    fullName?: string;
    username?: string;
    email?: string;
  };
  stadiums?: {
    name?: string;
    sport_id?: string;
  };
  time_slots?: {
    time?: string;
    period?: string;
  };
}

export default function AdminReservationsScreen() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.BOOKINGS);
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleDeleteReservation = async (reservationId: string) => {
    Alert.alert(
      'Delete Reservation',
      'Are you sure you want to delete this reservation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(`${API_ENDPOINTS.BOOKINGS}/${reservationId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setReservations(reservations.filter(r => r.id !== reservationId));
                Alert.alert('Success', 'Reservation deleted successfully');
              } else {
                throw new Error('Failed to delete reservation');
              }
            } catch (error) {
              console.error('Error deleting reservation:', error);
              Alert.alert('Error', 'Failed to delete reservation');
            }
          },
        },
      ]
    );
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <View style={styles.reservationCard}>
      <View style={styles.reservationInfo}>
        <Text style={styles.userName}>
          {item.user?.fullName || item.user?.username || `User ${item.user_id.substring(0, 8)}`}
        </Text>
        <Text style={styles.stadiumName}>
          {item.stadiums?.name || 'Unknown Stadium'}
        </Text>
        <Text style={styles.dateTime}>
          {item.date} at {item.time_slots?.time || 'Unknown Time'}
        </Text>
      </View>
      <View style={styles.reservationActions}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteReservation(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading reservations...</Text>
      </View>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Access denied. Admin privileges required.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservations Management</Text>
        <Text style={styles.countText}>{reservations.length} reservations</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  countText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  reservationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stadiumName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dateTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  reservationActions: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
});
