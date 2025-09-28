import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminStadiumsScreen from '../screens/AdminStadiumsScreen';
import AdminReservationsScreen from '../screens/AdminReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Stadiums') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
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
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ title: t('admin.dashboard') }}
      />
      <Tab.Screen 
        name="Users" 
        component={AdminUsersScreen}
        options={{ title: t('admin.users') }}
      />
      <Tab.Screen 
        name="Stadiums" 
        component={AdminStadiumsScreen}
        options={{ title: t('admin.stadiums') }}
      />
      <Tab.Screen 
        name="Reservations" 
        component={AdminReservationsScreen}
        options={{ title: t('admin.reservations') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
}