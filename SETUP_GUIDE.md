# GuardianX v2 - Setup Guide

## Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB installed and running (or MongoDB Atlas account)
- [ ] React Native CLI installed (`npm install -g react-native-cli`)
- [ ] Android Studio (for Android) or Xcode (for iOS)
- [ ] Twilio account (optional, for SMS)

## Step-by-Step Setup

### 1. Backend Setup

#### 1.1 Install Dependencies
```bash
cd Backend
npm install
```

#### 1.2 Configure MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB (if installed locally)
mongod

# MongoDB will run on mongodb://localhost:27017
```

**Option B: MongoDB Atlas**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file (see below)

#### 1.3 Create Environment File
Create `Backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/guardianx
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guardianx

# Twilio (Optional - SMS will be simulated if not provided)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Server
PORT=5000
```

#### 1.4 Start Backend Server
```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

**Test Backend**:
```bash
curl http://localhost:5000/test
# Should return: "API is working"
```

### 2. Mobile App Setup

#### 2.1 Install Dependencies
```bash
cd mobile
npm install
```

#### 2.2 Configure API URL

**For Android Emulator**:
- Use `http://10.0.2.2:5000` (Android emulator's alias for localhost)

**For iOS Simulator**:
- Use `http://localhost:5000`

**For Physical Device**:
- Find your computer's IP address:
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` (look for inet)
- Use `http://YOUR_IP:5000`

Update `mobile/src/services/api.js`:
```javascript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api/users'  // Android emulator
  // ? 'http://localhost:5000/api/users'  // iOS simulator
  // ? 'http://192.168.1.XXX:5000/api/users'  // Physical device (replace XXX)
  : 'https://your-backend-url.com/api/users';
```

#### 2.3 Configure Permissions

**Android** (`mobile/android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

**iOS** (`mobile/ios/GuardianX/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>GuardianX needs camera access for gesture-based emergency detection</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>GuardianX needs location access to share your location during emergencies</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>GuardianX needs background location access for continuous safety monitoring</string>
```

#### 2.4 Run Mobile App

**Android**:
```bash
npm run android
```

**iOS**:
```bash
npm run ios
```

### 3. First Run

1. **Register a User**:
   - Open app
   - Tap "Sign Up"
   - Enter name, email, password
   - Tap "Register"

2. **Add Emergency Contacts**:
   - Navigate to Contacts screen
   - Add at least one emergency contact (name + phone number)

3. **Activate Guardian Mode**:
   - Tap the shield icon on Dashboard
   - Guardian Mode activates
   - Navigate to "Guardian Mode" screen to see system status

4. **Test Emergency Flow**:
   - Tap "Alert" button on Dashboard
   - Or hold clenched fist for 3 seconds (gesture detection)
   - Emergency Detected screen appears
   - Check backend terminal for logs
   - Check SMS (or console logs if Twilio not configured)

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**:
- Check if MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas: Ensure IP whitelist includes your IP

**Port Already in Use**:
- Change PORT in `.env` to another port (e.g., 5001)
- Update mobile app API URL accordingly

### Mobile App Issues

**Cannot Connect to Backend**:
- Check API_BASE_URL in `mobile/src/services/api.js`
- Ensure backend is running
- Check firewall settings
- For physical device: Ensure phone and computer are on same network

**Permissions Denied**:
- Android: Go to Settings > Apps > GuardianX > Permissions
- iOS: Go to Settings > GuardianX > Permissions
- Grant Camera and Location permissions

**Gesture Detection Not Working**:
- Current implementation uses simulated detection
- For production: Integrate actual MediaPipe SDK
- Check camera permissions

### SMS Not Sending

**Twilio Not Configured**:
- SMS will be logged to backend console
- Check terminal for SMS simulation logs
- Format: `📩 SMS SIMULATION`

**Twilio Configured but Not Working**:
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- Verify phone number format (E.164: +1234567890)

## Development Tips

### Backend Logging
- All API requests are logged to console
- Emergency events show detailed logs
- SMS sending shows recipient and message

### Testing Emergency Flow
1. Start backend: `cd Backend && npm run dev`
2. Start mobile app: `cd mobile && npm start`
3. Trigger emergency (manual or gesture)
4. Watch terminal logs for complete flow

### Debugging
- Use React Native Debugger
- Check backend terminal for API logs
- Use `console.log()` in services for debugging
- Check MongoDB for stored data

## Production Deployment

### Backend
1. Use environment variables for all secrets
2. Set up MongoDB Atlas (production database)
3. Configure Twilio production credentials
4. Use process manager (PM2) for Node.js
5. Set up SSL/TLS certificates
6. Configure CORS for production domain

### Mobile App
1. Update API_BASE_URL to production URL
2. Configure app signing (Android/iOS)
3. Set up app store accounts
4. Test on physical devices
5. Implement proper error handling
6. Add analytics and crash reporting

## Next Steps

1. Integrate actual MediaPipe SDK for gesture detection
2. Implement background tasks for continuous monitoring
3. Add push notifications
4. Implement emergency history screen
5. Add route planning and monitoring
6. Enhance UI/UX based on user feedback

---

**Need Help?** Check the main README.md for architecture details and API documentation.

