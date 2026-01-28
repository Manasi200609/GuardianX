# GuardianX v2 - Production-Ready Personal Safety System

**GuardianX** is a silent, proactive personal safety application designed for real-world emergencies where the user may not be able to interact with their phone. It's not a panic button—it's a complete safety system that works hands-free.

## 🎯 Core Vision

GuardianX is a **hands-free emergency detection system** that:
- Works without unlocking the phone
- Works without touching the screen
- Works without speaking
- Uses real-time gesture recognition via MediaPipe
- Automatically shares location with emergency contacts
- Logs all emergency events for accountability

## 🏗️ Architecture

### Frontend (React Native)
- **Framework**: React Native (CLI, not Expo)
- **Platforms**: Android & iOS
- **UI Theme**: Teal + Light Background (calm, professional, reassuring)
- **Key Features**:
  - Guardian Mode (system state management)
  - MediaPipe gesture detection (clenched fist for 3 seconds)
  - Real-time location tracking
  - Emergency flow orchestration
  - Calm, professional UI

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Database**: MongoDB
- **SMS Service**: Twilio (with fallback simulation)
- **APIs**:
  - User registration/login
  - Guardian mode management
  - Emergency logging
  - Emergency contact management
  - Emergency history

## 📁 Project Structure

```
GuardianX/
├── Backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js     # User & guardian mode logic
│   │   └── emergencyController.js # Emergency logging logic
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── EmergencyLog.js      # Emergency log schema
│   ├── routes/
│   │   ├── userRoutes.js         # User routes
│   │   ├── sosRoutes.js          # SOS routes (legacy)
│   │   └── emergencyRoutes.js    # Emergency log routes
│   ├── utils/
│   │   └── smsService.js         # Twilio SMS service
│   └── server.js                 # Express server
│
└── mobile/
    ├── src/
    │   ├── components/           # Reusable UI components
    │   ├── context/
    │   │   └── GuardianContext.js # Global state management
    │   ├── navigation/
    │   │   └── AppNavigator.js   # Navigation setup
    │   ├── screens/
    │   │   ├── DashboardScreen.js      # Main dashboard
    │   │   ├── GuardianModeScreen.js  # Guardian Mode status
    │   │   ├── EmergencyDetectedScreen.js # Emergency feedback
    │   │   └── ...               # Other screens
    │   ├── services/
    │   │   ├── api.js            # API client
    │   │   ├── gestureDetection.js    # MediaPipe gesture detection
    │   │   ├── emergencyFlow.js      # Emergency orchestration
    │   │   └── locationTracking.js    # Location tracking service
    │   └── utils/
    │       └── theme.js          # Design system (teal theme)
    └── App.js                    # App entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- React Native CLI
- Android Studio / Xcode (for mobile development)
- Twilio account (optional, for SMS)

### Backend Setup

1. **Install dependencies**:
```bash
cd Backend
npm install
```

2. **Configure environment**:
Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/guardianx
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

3. **Start MongoDB** (if local):
```bash
mongod
```

4. **Start backend server**:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Mobile Setup

1. **Install dependencies**:
```bash
cd mobile
npm install
```

2. **Configure API URL**:
Update `mobile/src/services/api.js`:
```javascript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:5000/api/users'  // Use your computer's IP
  : 'https://your-backend-url.com/api/users';
```

3. **Run on Android**:
```bash
npm run android
```

4. **Run on iOS**:
```bash
npm run ios
```

## 🎮 How It Works

### 1. Guardian Mode Activation
- User taps the shield icon on Dashboard
- System activates:
  - Gesture detection (MediaPipe)
  - Location tracking
  - Route monitoring
- User navigates to Guardian Mode screen to see status

### 2. Emergency Detection
**Gesture-Based SOS**:
- User holds clenched fist for 3 seconds
- MediaPipe detects gesture in real-time
- System triggers emergency flow

**Manual SOS**:
- User taps "Alert" button
- System triggers emergency flow

### 3. Emergency Flow
When emergency is detected:
1. **GPS Location**: Fetches current location with high accuracy
2. **SMS Alert**: Sends SMS to all emergency contacts with:
   - User's name
   - Google Maps link to location
   - Timestamp
3. **Backend Logging**: Logs emergency event to database
4. **UI Feedback**: Shows calm "Emergency detected. Help is on the way." screen

### 4. Emergency Logs
All emergencies are logged with:
- User ID
- Trigger type (gesture, manual, motion, route_deviation)
- Location (lat/lng, accuracy, address)
- SMS status
- Contacts notified
- Timestamp

## 🔧 Key Services

### Gesture Detection Service
- Uses MediaPipe Hands for real-time gesture recognition
- Detects clenched fist gesture
- Tracks gesture duration (3 seconds threshold)
- Works in background when Guardian Mode is active

### Emergency Flow Service
- Orchestrates complete emergency response
- Gets GPS location
- Sends SMS via backend
- Logs to backend
- Handles errors gracefully

### Location Tracking Service
- Continuous location updates (every 5 seconds or 10 meters)
- Background location support
- Location history
- Route deviation detection

## 📱 Demo Flow

1. **Start Backend**:
```bash
cd Backend
npm run dev
```

2. **Start Mobile App**:
```bash
cd mobile
npm start
```

3. **Demo Steps**:
   - Register/Login
   - Add emergency contacts
   - Activate Guardian Mode
   - View Guardian Mode screen (shows system status)
   - Trigger emergency (gesture or manual)
   - See Emergency Detected screen
   - Check backend logs for emergency event
   - Check SMS (or console logs if Twilio not configured)

## 🎨 Design System

**Color Palette**:
- Primary: `#14B8A6` (Teal)
- Background: `#F8FAFC` (Light gray-blue)
- Surface: `#FFFFFF` (White)
- Success: `#10B981` (Green)
- Danger: `#EF4444` (Red)

**Typography**:
- Hero: 32px
- Title: 22px
- Subtitle: 16px
- Body: 14px
- Caption: 12px

## 🔐 Permissions Required

**Android**:
- `CAMERA` - For gesture detection
- `ACCESS_FINE_LOCATION` - For GPS tracking
- `ACCESS_BACKGROUND_LOCATION` - For background tracking
- `SEND_SMS` - For SMS alerts (optional, handled by backend)

**iOS**:
- `NSCameraUsageDescription` - For gesture detection
- `NSLocationWhenInUseUsageDescription` - For location tracking
- `NSLocationAlwaysAndWhenInUseUsageDescription` - For background tracking

## 🧪 Testing

### Backend API Testing
```bash
# Test emergency logging
curl -X POST http://localhost:5000/api/emergencies \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "triggerType": "manual",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }'

# Get emergency logs
curl http://localhost:5000/api/emergencies/user/USER_ID
```

### Mobile Testing
- Test gesture detection (simulated in current implementation)
- Test location tracking
- Test emergency flow end-to-end
- Verify SMS sending (check Twilio console or backend logs)

## 🚧 Production Considerations

1. **MediaPipe Integration**:
   - Current implementation uses simulated gesture detection
   - For production: Integrate `@mediapipe/hands` or native MediaPipe SDK
   - Consider performance optimization for continuous detection

2. **Background Execution**:
   - Implement background tasks for gesture detection
   - Use background location updates
   - Handle app state changes (foreground/background)

3. **Security**:
   - Add authentication tokens (JWT)
   - Encrypt sensitive data
   - Secure API endpoints
   - Rate limiting

4. **Performance**:
   - Optimize MediaPipe detection (reduce frame rate when idle)
   - Batch location updates
   - Cache emergency contacts

5. **Reliability**:
   - Retry logic for SMS sending
   - Offline queue for emergencies
   - Fallback mechanisms

## 📊 API Endpoints

### User Management
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `PUT /api/users/guardian-mode/:id` - Toggle guardian mode
- `PUT /api/users/contacts/:id` - Update emergency contacts
- `GET /api/users/contacts/:id` - Get emergency contacts

### Emergency Management
- `POST /api/emergencies` - Log emergency event
- `GET /api/emergencies/user/:userId` - Get user's emergency logs
- `PUT /api/emergencies/:emergencyId` - Update emergency status

### Legacy SOS (for compatibility)
- `POST /api/users/:id/sos` - Trigger SOS (legacy endpoint)

## 🎯 Hackathon Demo Tips

1. **Terminal Logs**: Backend shows detailed logs for all operations
2. **SMS Simulation**: If Twilio not configured, SMS is logged to console
3. **Emergency Flow**: Complete flow is visible in terminal
4. **UI Feedback**: Emergency Detected screen shows clear status
5. **Guardian Mode**: Status screen shows all system indicators

## 📝 License

This project is built for hackathon demonstration purposes.

## 👥 Team

Built with ❤️ for real-world safety.

---

**GuardianX v2** - Silent. Proactive. Reliable.

