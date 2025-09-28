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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { NotificationService } from '../services/notificationService';
import { ReminderService } from '../services/reminderService';

interface Stadium {
  id: string;
  name: string;
  sport_id: string;
}

interface TimeSlot {
  id: string;
  time: string;
  period: string;
}

export default function BookingScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sports = [
    { id: 'football', name: t('sports.football') },
    { id: 'basketball', name: t('sports.basketball') },
    { id: 'handball', name: t('sports.handball') },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      const [stadiumsResponse, timeSlotsResponse] = await Promise.all([
        apiCall(API_ENDPOINTS.STADIUMS),
        apiCall(API_ENDPOINTS.TIME_SLOTS)
      ]);

      if (stadiumsResponse.ok) {
        const stadiumsData = await stadiumsResponse.json();
        setStadiums(stadiumsData);
      }

      if (timeSlotsResponse.ok) {
        const timeSlotsData = await timeSlotsResponse.json();
        setTimeSlots(timeSlotsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert(t('common.error'), 'Failed to load stadium and time slot data');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBookedTimeSlots = async () => {
    if (!selectedDate || !selectedStadium) return;

    try {
      const response = await apiCall(`${API_ENDPOINTS.BOOKINGS}?date=${selectedDate}&stadium=${selectedStadium}`);
      if (response.ok) {
        const bookings = await response.json();
        const bookedSlots = new Set(bookings.map((booking: any) => booking.time_slot_id));
        setBookedTimeSlots(bookedSlots);
      }
    } catch (error) {
      console.error('Error fetching booked time slots:', error);
    }
  };

  useEffect(() => {
    fetchBookedTimeSlots();
  }, [selectedDate, selectedStadium]);

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        id: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const handleBooking = async () => {
    if (!selectedSport || !selectedDate || !selectedTime || !selectedStadium || !user) {
      Alert.alert(t('common.error'), 'Please select all required fields');
      return;
    }

    const selectedTimeSlot = timeSlots.find(slot => slot.time === selectedTime);
    if (selectedTimeSlot && bookedTimeSlots.has(selectedTimeSlot.id)) {
      Alert.alert(t('common.error'), 'This time slot is already booked');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          stadiumId: selectedStadium,
          date: selectedDate,
          timeSlotId: selectedTimeSlot?.id,
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const bookingData = await response.json();
      
      const stadium = filteredStadiums.find(s => s.id === selectedStadium);
      const stadiumName = stadium?.name || 'Unknown Stadium';
      
      await NotificationService.sendBookingConfirmation({
        stadium: stadiumName,
        date: selectedDate,
        time: selectedTime,
      });

      await ReminderService.scheduleReservationReminder({
        id: bookingData.id,
        stadium: stadiumName,
        date: selectedDate,
        time: selectedTime,
      });
      
      Alert.alert(t('common.success'), 'Stadium booked successfully! You will receive confirmation and reminder notifications.');
      
      setSelectedSport(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedStadium(null);
      setBookedTimeSlots(new Set());
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(t('common.error'), error instanceof Error ? error.message : 'Failed to book stadium');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const filteredStadiums = selectedSport 
    ? stadiums.filter(stadium => stadium.sport_id === selectedSport)
    : [];

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('booking.title')}</Text>
        <Text style={styles.subtitle}>
          {t('booking.subtitle').replace('{name}', user?.fullName || user?.username || 'User')}
        </Text>
        <Text style={styles.userProfile}>
          {t('booking.userProfile').replace('{id}', user?.studentId || 'N/A')}
        </Text>
      </View>

      {/* Sport Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('booking.chooseSport')}</Text>
        <View style={styles.optionsContainer}>
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.optionButton,
                selectedSport === sport.id && styles.selectedOption
              ]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <Text style={[
                styles.optionText,
                selectedSport === sport.id && styles.selectedOptionText
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Selection */}
      {selectedSport && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.chooseDate')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              {getAvailableDates().map((date) => (
                <TouchableOpacity
                  key={date.id}
                  style={[
                    styles.optionButton,
                    selectedDate === date.id && styles.selectedOption
                  ]}
                  onPress={() => setSelectedDate(date.id)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedDate === date.id && styles.selectedOptionText
                  ]}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Stadium Selection */}
      {selectedSport && selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.chooseStadium')}</Text>
          <View style={styles.optionsContainer}>
            {filteredStadiums.map((stadium) => (
              <TouchableOpacity
                key={stadium.id}
                style={[
                  styles.optionButton,
                  selectedStadium === stadium.id && styles.selectedOption
                ]}
                onPress={() => setSelectedStadium(stadium.id)}
              >
                <Text style={[
                  styles.optionText,
                  selectedStadium === stadium.id && styles.selectedOptionText
                ]}>
                  {stadium.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Time Selection */}
      {selectedSport && selectedDate && selectedStadium && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.chooseTime')}</Text>
          <View style={styles.optionsContainer}>
            {timeSlots.map((slot) => {
              const isBooked = bookedTimeSlots.has(slot.id);
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.optionButton,
                    selectedTime === slot.time && styles.selectedOption,
                    isBooked && styles.bookedOption
                  ]}
                  onPress={() => !isBooked && setSelectedTime(slot.time)}
                  disabled={isBooked}
                >
                  <Text style={[
                    styles.optionText,
                    selectedTime === slot.time && styles.selectedOptionText,
                    isBooked && styles.bookedOptionText
                  ]}>
                    {slot.time} {isBooked ? `(${t('booking.booked')})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Book Button */}
      {selectedSport && selectedDate && selectedTime && selectedStadium && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.bookButton, isLoading && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.bookButtonText}>{t('booking.bookNow')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

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
  userProfile: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#2F7A7D',
    borderColor: '#2F7A7D',
  },
  bookedOption: {
    backgroundColor: '#e0e0e0',
    borderColor: '#ccc',
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  bookedOptionText: {
    color: '#999',
  },
  bookButton: {
    backgroundColor: '#2F7A7D',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});