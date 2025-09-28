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
import { useLanguage } from '../contexts/LanguageContext';

interface Stadium {
  id: string;
  name: string;
  sport_id: string;
  capacity?: number;
  location?: string;
}

export default function AdminStadiumsScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStadiums = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.STADIUMS);
      if (!response.ok) {
        throw new Error('Failed to fetch stadiums');
      }
      const data = await response.json();
      setStadiums(data);
    } catch (error) {
      console.error('Error fetching stadiums:', error);
      Alert.alert(t('common.error'), 'Failed to load stadiums');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStadiums();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStadiums();
  };

  const handleDeleteStadium = async (stadiumId: string) => {
    Alert.alert(
      t('common.confirm'),
      'Are you sure you want to delete this stadium?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(`${API_ENDPOINTS.STADIUMS}/${stadiumId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setStadiums(stadiums.filter(s => s.id !== stadiumId));
                Alert.alert(t('common.success'), 'Stadium deleted successfully');
              } else {
                throw new Error('Failed to delete stadium');
              }
            } catch (error) {
              console.error('Error deleting stadium:', error);
              Alert.alert(t('common.error'), 'Failed to delete stadium');
            }
          },
        },
      ]
    );
  };

  const renderStadium = ({ item }: { item: Stadium }) => (
    <View style={styles.stadiumCard}>
      <View style={styles.stadiumInfo}>
        <Text style={styles.stadiumName}>{item.name}</Text>
        <Text style={styles.stadiumSport}>
          Sport: {item.sport_id}
        </Text>
        {item.capacity && (
          <Text style={styles.stadiumCapacity}>
            Capacity: {item.capacity}
          </Text>
        )}
        {item.location && (
          <Text style={styles.stadiumLocation}>
            Location: {item.location}
          </Text>
        )}
      </View>
      <View style={styles.stadiumActions}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteStadium(item.id)}
        >
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
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
        <Text style={styles.title}>{t('admin.stadiums')}</Text>
        <Text style={styles.countText}>{stadiums.length} stadiums</Text>
      </View>
      
      <FlatList
        data={stadiums}
        renderItem={renderStadium}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stadiums found</Text>
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
  stadiumCard: {
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
  stadiumInfo: {
    flex: 1,
  },
  stadiumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stadiumSport: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stadiumCapacity: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stadiumLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stadiumActions: {
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