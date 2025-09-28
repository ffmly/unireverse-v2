# 🚀 Production Deployment Guide

## ✅ **Current Status: READY FOR PRODUCTION**

Your StadiumBook application is now configured to work in production environments.

## 🔧 **Configuration Changes Made**

### 1. **Mobile App API Configuration**
- ✅ Updated to use environment variables
- ✅ Supports both development and production URLs
- ✅ Automatic fallback to localhost for development

### 2. **Environment Variable Support**
- ✅ `EXPO_PUBLIC_API_URL` for mobile app
- ✅ All Firebase configurations use environment variables
- ✅ No hardcoded production URLs

## 📱 **Mobile App Configuration**

### **Development Environment:**
```env
# mobile-app/.env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### **Production Environment:**
```env
# mobile-app/.env
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

## 🌐 **Web App Configuration**

### **Environment Variables:**
```env
# .env.local (for development)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Server-side only
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 🚀 **Deployment Steps**

### **Step 1: Deploy Web App to Vercel**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add all the environment variables from above
   - Redeploy the project

### **Step 2: Update Mobile App Configuration**

1. **Update mobile app environment:**
   ```bash
   cd mobile-app
   ```

2. **Create production .env file:**
   ```env
   # Firebase Configuration (same as web app)
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # API Configuration (replace with your Vercel URL)
   EXPO_PUBLIC_API_URL=https://your-app.vercel.app
   ```

3. **Build for production:**
   ```bash
   # For Android
   npx expo build:android

   # For iOS
   npx expo build:ios
   ```

### **Step 3: Test Production Setup**

1. **Test Web App:**
   - Visit your Vercel URL
   - Test all features (login, booking, admin panel)

2. **Test Mobile App:**
   - Install the production build
   - Test API connectivity
   - Verify all features work

## 🔒 **Security Configuration**

### **Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Stadiums - read for all, write for admins
    match /stadiums/{stadiumId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Time slots - read for all, write for admins
    match /timeSlots/{timeSlotId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bookings - authenticated users only
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
    
    // Friendly matches - authenticated users only
    match /friendlyMatches/{matchId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 **Production URLs**

After deployment, your app will be available at:
- **Web App**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/admin/dashboard`
- **Mobile App**: Available on app stores

## ✅ **Production Checklist**

- [ ] Web app deployed to Vercel
- [ ] Environment variables configured
- [ ] Mobile app built with production API URL
- [ ] Firestore security rules updated
- [ ] SSL certificates active (automatic with Vercel)
- [ ] All features tested in production
- [ ] Admin user created
- [ ] Domain configured (optional)

## 🎯 **Key Features Ready for Production**

- ✅ **Stadium Booking System** - Real-time availability
- ✅ **Friendly Match Management** - Player tracking
- ✅ **Admin Dashboard** - Complete management
- ✅ **Mobile App** - iOS and Android support
- ✅ **Authentication** - Firebase Auth
- ✅ **Security** - Input validation, rate limiting
- ✅ **Real-time Updates** - Live synchronization
- ✅ **Responsive Design** - Works on all devices

## 🚨 **Important Notes**

1. **API URLs**: Mobile app now uses environment variables
2. **Environment Variables**: Must be set in both Vercel and mobile app
3. **Firebase Rules**: Update security rules for production
4. **Testing**: Test thoroughly before going live
5. **Backup**: Enable Firebase automatic backups

**Your application is now fully configured for production deployment!** 🎉
