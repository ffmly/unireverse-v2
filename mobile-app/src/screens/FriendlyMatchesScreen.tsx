import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_ENDPOINTS, apiCall } from '../config/api';

interface FriendlyMatch {
  id: string;
  date: string;
  time: string;
  stadium: {
    id: string;
    name: string;
    capacity: number;
  };
  team1: string;
  team2: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  hostId: string;
  guestId?: string;
  host: {
    id: string;
    name: string;
    email: string;
  };
  guest?: {
    id: string;
    name: string;
    email: string;
  };
  maxPlayers: number;
  currentPlayers: number;
  description?: string;
  skillLevel?: string;
  isPublic?: boolean;
  createdAt: string;
}

interface Stadium {
  id: string;
  name: string;
  capacity: number;
}

export default function FriendlyMatchesScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [matches, setMatches] = useState<FriendlyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [creating, setCreating] = useState(false);
  const [showStadiumPicker, setShowStadiumPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  
  // Create match form state
  const [formData, setFormData] = useState({
    stadiumId: '',
    date: '',
    time: '',
    team1: '',
    team2: '',
    maxPlayers: 10,
    description: '',
    skillLevel: 'any',
    isPublic: true,
  });

  const fetchMatches = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.FRIENDLY_MATCHES);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      } else {
        console.error('Failed to fetch friendly matches');
      }
    } catch (error) {
      console.error('Error fetching friendly matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStadiums = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.STADIUMS);
      if (response.ok) {
        const data = await response.json();
        setStadiums(data);
      } else {
        console.error('Failed to fetch stadiums');
      }
    } catch (error) {
      console.error('Error fetching stadiums:', error);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchStadiums();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const handleJoinMatch = async (matchId: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a match.');
      return;
    }

    try {
      const response = await apiCall(API_ENDPOINTS.FRIENDLY_MATCHES, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          guestId: user.id,
          action: 'join'
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'You have joined the friendly match!');
        fetchMatches(); // Refresh the list
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to join the match.');
      }
    } catch (error) {
      console.error('Error joining match:', error);
      Alert.alert('Error', 'Failed to join the match. Please try again.');
    }
  };

  const checkStadiumAvailability = async (stadiumId: string, date: string, time: string) => {
    try {
      // Check for existing bookings on this stadium
      const bookingsResponse = await apiCall(`${API_ENDPOINTS.BOOKINGS}?date=${date}&stadium=${stadiumId}`);
      if (bookingsResponse.ok) {
        const bookings = await bookingsResponse.json();
        const hasBooking = bookings.some((booking: any) => booking.time_slot_id === time);
        if (hasBooking) {
          return { available: false, reason: 'This time slot is already booked for this stadium' };
        }
      }

      // Check for existing friendly matches on this stadium
      const matchesResponse = await apiCall(API_ENDPOINTS.FRIENDLY_MATCHES);
      if (matchesResponse.ok) {
        const matches = await matchesResponse.json();
        const hasMatch = matches.some((match: any) => 
          match.stadiumId === stadiumId && 
          match.date === date && 
          match.time === time && 
          ['pending', 'confirmed'].includes(match.status)
        );
        if (hasMatch) {
          return { available: false, reason: 'This time slot already has a friendly match on this stadium' };
        }
      }

      return { available: true };
    } catch (error) {
      console.error('Error checking stadium availability:', error);
      return { available: true }; // Allow creation if check fails
    }
  };

  const handleCreateMatch = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a match.');
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateMatchSubmit = async () => {
    if (!user) return;

    // Validate form
    if (!formData.stadiumId || !formData.date || !formData.time || !formData.team1) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate max players against stadium capacity
    const selectedStadium = stadiums.find(s => s.id === formData.stadiumId);
    if (selectedStadium && formData.maxPlayers > selectedStadium.capacity) {
      Alert.alert('Error', `Maximum players (${formData.maxPlayers}) cannot exceed stadium capacity (${selectedStadium.capacity})`);
      return;
    }

    // Check stadium availability (stadium-specific check)
    const availability = await checkStadiumAvailability(formData.stadiumId, formData.date, formData.time);
    if (!availability.available) {
      Alert.alert('Stadium Unavailable', availability.reason);
      return;
    }

    setCreating(true);
    try {
      const matchData = {
        hostId: user.id,
        stadiumId: formData.stadiumId,
        date: formData.date,
        time: formData.time,
        team1: formData.team1,
        team2: formData.team2 || 'Open',
        sportId: 'football', // Default sport
        maxPlayers: formData.maxPlayers,
        description: formData.description,
        skillLevel: formData.skillLevel,
        isPublic: formData.isPublic,
      };

      const response = await apiCall(API_ENDPOINTS.FRIENDLY_MATCHES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Friendly match created successfully!');
        setShowCreateModal(false);
        setFormData({
          stadiumId: '',
          date: '',
          time: '',
          team1: '',
          team2: '',
          maxPlayers: 10,
          description: '',
          skillLevel: 'any',
          isPublic: true,
        });
        fetchMatches(); // Refresh the list
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to create the match.');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'Failed to create the match. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F7A7D" />
        <Text style={styles.loadingText}>Loading friendly matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Friendly Matches</Text>
          <Text style={styles.subtitle}>Join or create friendly matches</Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateMatch}>
          <Text style={styles.createButtonText}>+ Create New Match</Text>
        </TouchableOpacity>

        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friendly matches available</Text>
            <Text style={styles.emptySubtext}>Create a new match to get started!</Text>
          </View>
        ) : (
          <View style={styles.matchesList}>
            {matches.map((match) => (
              <View key={match.id} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <Text style={styles.matchDate}>{match.date}</Text>
                  <Text style={styles.matchTime}>{match.time}</Text>
                </View>
                
                <View style={styles.matchTeams}>
                  <Text style={styles.teamText}>{match.team1}</Text>
                  <Text style={styles.vsText}>VS</Text>
                  <Text style={styles.teamText}>{match.team2 || 'Open'}</Text>
                </View>
                
                <Text style={styles.stadiumText}>📍 {match.stadium.name}</Text>
                
                <View style={styles.matchInfo}>
                  <Text style={styles.playerCount}>
                    👥 {match.currentPlayers}/{match.maxPlayers} players
                  </Text>
                  {match.skillLevel && match.skillLevel !== 'any' && (
                    <Text style={styles.skillLevel}>
                      🏆 {match.skillLevel.charAt(0).toUpperCase() + match.skillLevel.slice(1)}
                    </Text>
                  )}
                </View>
                
                {match.description && (
                  <Text style={styles.descriptionText}>{match.description}</Text>
                )}
                
                <View style={styles.matchFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
                    <Text style={styles.statusText}>{match.status.toUpperCase()}</Text>
                  </View>
                  
                  {match.status === 'pending' && match.hostId !== user?.id && match.currentPlayers < match.maxPlayers && (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => handleJoinMatch(match.id)}
                    >
                      <Text style={styles.joinButtonText}>Join Match</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Match Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Match</Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Stadium *</Text>
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() => setShowStadiumPicker(!showStadiumPicker)}
              >
                <Text style={styles.pickerText}>
                  {formData.stadiumId 
                    ? stadiums.find(s => s.id === formData.stadiumId)?.name || 'Select Stadium'
                    : 'Select Stadium'
                  }
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
              
              {showStadiumPicker && (
                <View style={styles.dropdown}>
                  {stadiums.map((stadium) => (
                    <TouchableOpacity
                      key={stadium.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({...formData, stadiumId: stadium.id});
                        setShowStadiumPicker(false);
                      }}
                    >
                      <View style={styles.stadiumItem}>
                        <Text style={styles.dropdownText}>
                          {stadium.name} ({stadium.capacity} capacity)
                        </Text>
                        <Text style={styles.independenceText}>
                          🏟️ Independent booking
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({...formData, date: text})}
              />

              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.time}
                onChangeText={(text) => setFormData({...formData, time: text})}
              />

              <Text style={styles.label}>Team 1 Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter team name"
                value={formData.team1}
                onChangeText={(text) => setFormData({...formData, team1: text})}
              />

              <Text style={styles.label}>Team 2 Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter team name (optional)"
                value={formData.team2}
                onChangeText={(text) => setFormData({...formData, team2: text})}
              />

              <Text style={styles.label}>Max Players</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={formData.maxPlayers.toString()}
                onChangeText={(text) => setFormData({...formData, maxPlayers: parseInt(text) || 10})}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Match description (optional)"
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Skill Level</Text>
              <TouchableOpacity
                style={styles.pickerContainer}
                onPress={() => setShowSkillPicker(!showSkillPicker)}
              >
                <Text style={styles.pickerText}>
                  {formData.skillLevel.charAt(0).toUpperCase() + formData.skillLevel.slice(1)}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
              
              {showSkillPicker && (
                <View style={styles.dropdown}>
                  {['any', 'beginner', 'intermediate', 'advanced'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({...formData, skillLevel: level});
                        setShowSkillPicker(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, creating && styles.disabledButton]}
                onPress={handleCreateMatchSubmit}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>Create Match</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return '#4CAF50';
    case 'pending':
      return '#FFC107';
    case 'cancelled':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5F9EA0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5F9EA0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F4F8',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#2F7A7D',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#E8F4F8',
  },
  matchesList: {
    gap: 15,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F7A7D',
  },
  matchTime: {
    fontSize: 14,
    color: '#666666',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teamText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F7A7D',
    marginHorizontal: 10,
  },
  stadiumText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinButton: {
    backgroundColor: '#2F7A7D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for enhanced match display
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerCount: {
    fontSize: 14,
    color: '#2F7A7D',
    fontWeight: '600',
  },
  skillLevel: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F7A7D',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    maxHeight: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666666',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  stadiumItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  independenceText: {
    fontSize: 12,
    color: '#2F7A7D',
    fontStyle: 'italic',
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
