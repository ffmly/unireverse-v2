import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import BookingScreen from '../screens/BookingScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import FriendlyMatchesScreen from '../screens/FriendlyMatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

const Tab = createBottomTabNavigator();

export default function UserTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Booking') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'FriendlyMatches') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2F7A7D',
        tabBarInactiveTintColor: '#7A9B9C',
        headerStyle: {
          backgroundColor: '#2F7A7D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{ title: t('nav.booking') }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationsScreen}
        options={{ title: t('nav.reservations') }}
      />
      <Tab.Screen 
        name="FriendlyMatches" 
        component={FriendlyMatchesScreen}
        options={{ title: 'Friendly Matches' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationSettingsScreen}
        options={{ title: t('nav.settings') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
}