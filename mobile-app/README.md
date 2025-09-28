# StadiumBook Mobile App

This is the mobile application for StadiumBook, built with React Native and Expo.

## Features

- **Cross-platform**: Works on both Android and iOS
- **User Authentication**: Login and registration
- **Stadium Booking**: Book stadiums with an intuitive interface
- **Reservation Management**: View and manage your bookings
- **Admin Dashboard**: Complete admin functionality for managing the system
- **Real-time Updates**: Firebase integration for live data

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration values

3. Start the development server:
```bash
npm start
```

4. Run on device/simulator:
```bash
# Android
npm run android

# iOS (requires macOS)
npm run ios

# Web
npm run web
```

## Project Structure

```
src/
├── config/
│   └── firebase.ts          # Firebase configuration
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── navigation/
│   ├── UserTabs.tsx         # User navigation tabs
│   └── AdminTabs.tsx        # Admin navigation tabs
└── screens/
    ├── LoginScreen.tsx      # Login screen
    ├── RegisterScreen.tsx   # Registration screen
    ├── BookingScreen.tsx    # Stadium booking
    ├── ReservationsScreen.tsx # User reservations
    ├── ProfileScreen.tsx    # User profile
    └── admin/               # Admin screens
        ├── AdminDashboardScreen.tsx
        ├── AdminUsersScreen.tsx
        ├── AdminStadiumsScreen.tsx
        └── AdminReservationsScreen.tsx
```

## Dependencies

- React Navigation for navigation
- Firebase for backend services
- Expo Vector Icons for icons
- AsyncStorage for local storage

## Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```
