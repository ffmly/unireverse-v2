Since the system had both of web and mobile app , so this is a guid to setup env



### 1. Web Application (.env.local)
Create `.env.local` in the root directory:

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

### 2. Mobile Application (.env)
Create `.env` in the `mobile-app` directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
# For development (localhost)
EXPO_PUBLIC_API_URL=http://localhost:3000
# For production (replace with your deployed URL)
# EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Generate service account key
5. Update environment variables

## Running the Application

### Web App
```bash
npm install
npm run dev
```

### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

## First Admin User

Run the script to create the first admin user:
```bash
node scripts/create-users.js
```
