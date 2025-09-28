#  Stadium Management System

comprehensive stadium booking and management system built for university clubs, featuring real-time availability, friendly match creation, and multi-platform support.

##  Features

### Core Functionality
- **Stadium Booking System** - Real-time availability with conflict prevention
- **Friendly Match Management** - Create and join matches with player count tracking
- **Multi-Platform Support** - Web application and mobile app (iOS/Android)
- **Stadium Independence** - Each stadium operates independently
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
- **State Management**: React Context API, Custom Hooks

### Backend
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **API**: Next.js API Routes with RESTful architecture

### Security & Validation
- **Input Validation**: Zod schemas
- **Data Sanitization**: XSS prevention
- **Rate Limiting**: API protection
- **Encryption**: AES-256 for sensitive data









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


### System Design
- **Microservices Architecture** - Modular API design
- **Real-time Synchronization** - WebSocket connections
- **Cross-platform Compatibility** - Shared business logic
- **Scalable Database Design** - NoSQL with optimized queries



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









---

**Built with ❤️**
