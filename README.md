# 🏟️ StadiumBook - Stadium Management System

comprehensive stadium booking and management system built for university clubs, featuring real-time availability, friendly match creation, and multi-platform support.

## 🚀 Features

### Core Functionality
- **Stadium Booking System** - Real-time availability with conflict prevention
- **Friendly Match Management** - Create and join matches with player count tracking
- **Multi-Platform Support** - Web application and mobile app (iOS/Android)
- **Real-time Updates** - Live synchronization across all platforms



### Admin Features
- **Dashboard Management** - Complete admin control panel
- **User Management** - Add, edit, and manage club members
- **Reservation Monitoring** - Real-time booking oversight
- **Stadium Configuration** - Add new stadiums and time slots

## 🛠️ Tech Stack

### Frontend
- **Web**: Next.js 15, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo


### Backend
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **API**: Next.js API Routes 

### Security & Validation
- **Input Validation**: Zod schemas
- **Data Sanitization**: XSS prevention
- **Rate Limiting**: API protection
- **Encryption**: AES-256 for sensitive data

## 📱 Platforms

### Web Application

- **Features**: Admin dashboard, booking management
- **Access**: Administrators and club members

### Mobile Application
- **Platform**: React Native with Expo
- **Features**: Mobile booking, friendly matches, push notifications
- **Access**: All club members

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**

2. **Install dependencies**


3. **Environment Setup**
   Create `.env.local` file in the root directory:
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Admin Configuration (Server-side)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="your_private_key"

   # Encryption Key (32 characters)
   ENCRYPTION_KEY=your_32_character_encryption_key
   ```


 **Mobile App Setup**
   ```bash
   cd mobile-app
   npm install
   
   # Create mobile environment file
   echo "EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id" > .env
   
   npx expo start
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Generate service account key
5. Update environment variables

### Database Structure
```
stadiums/
  - {stadiumId}/
    - name: string
    - location: string
    - capacity: number
    - facilities: string[]

bookings/
  - {bookingId}/
    - user_id: string
    - stadium_id: string
    - date: string
    - time_slot_id: string
    - createdAt: timestamp

friendlyMatches/
  - {matchId}/
    - hostId: string
    - stadiumId: string
    - date: string
    - time: string
    - team1: string
    - team2: string
    - maxPlayers: number
    - currentPlayers: number
    - status: string
```

## 🏗️ Architecture

### System Design
- **Microservices Architecture** - Modular API design
- **Real-time Synchronization** - WebSocket connections
- **Cross-platform Compatibility** - Shared business logic
- **Scalable Database Design** - NoSQL with optimized queries

### Security Implementation
- **Input Validation** - Zod schemas for all endpoints
- **Authentication Middleware** - Role-based access control
- **Rate Limiting** - API abuse prevention
- **Data Encryption** - Sensitive data protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Stadiums
- `GET /api/stadiums` - List all stadiums
- `POST /api/stadiums` - Create stadium (admin)

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings` - Cancel booking

### Friendly Matches
- `GET /api/friendly-matches` - List matches
- `POST /api/friendly-matches` - Create match
- `PUT /api/friendly-matches` - Join/leave match




**Built with ❤️**