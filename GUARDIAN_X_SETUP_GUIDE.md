# GuardianX Triple-Tap SOS System - Complete Setup Guide

## 📋 Overview

This is a production-grade triple-tap gesture detection system for GuardianX that coordinates:
- **Gesture Detection**: Detects 3 taps within 600ms
- **SOS Confirmation**: 5-second countdown with PIN/long-press cancel
- **Location Acquisition**: High-accuracy GPS with fallback
- **Contact Notification**: API + SMS fallback delivery
- **Security**: Secure state management with cooldown periods

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd mobile
npm install
# or
yarn install
```

This installs the required packages:
- `@react-native-async-storage/async-storage` - Secure state persistence
- `expo-location` - GPS location with high accuracy
- `expo-secure-store` - Encrypted credential storage
- `expo-sensors` - Accelerometer for tap detection
- `expo-sms` - SMS fallback delivery
- `expo-contacts` - Emergency contact management

### 2. Update Native Configuration Files

#### Android Setup

**Option A: Automated (Recommended)**
```bash
# Copy the Guardian X AndroidManifest configuration
cp android/app/src/main/AndroidManifest_GUARDIAN_CONFIG.xml \
   android/app/src/main/AndroidManifest.xml
```

**Option B: Manual Integration**
Open `android/app/src/main/AndroidManifest.xml` and add these permissions:

```xml
<!-- Location Permissions -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Sensor & Communication -->
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.READ_CONTACTS" />

<!-- Network & System -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### iOS Setup

**Option A: Automated (Recommended)**
```bash
# Use app.json to configure iOS
cd mobile
eas update --platform ios
```

**Option B: Manual Integration**
Edit `ios/GuardianX/Info.plist` and add:

```xml
<!-- Location Permissions -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>GuardianX needs access to your location for emergency SOS alerts</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>GuardianX needs your location while active for SOS preparation</string>

<!-- Background Modes -->
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
  <string>fetch</string>
</array>

<!-- Contacts -->
<key>NSContactsUsageDescription</key>
<string>GuardianX needs access to emergency contacts</string>
```

---

## 🔧 Architecture

### Service Layer

#### `GestureDetectionService.js`
Detects triple-tap gestures with:
- Event-based back button listener (no polling)
- Optional accelerometer supplementary detection
- Debouncing to prevent false positives
- 30-second cooldown after trigger
- Haptic feedback on each tap

```javascript
// Usage in components:
import GestureDetectionService from '../services/GestureDetectionService';

GestureDetectionService.initialize((gestureData) => {
  console.log('Triple-tap detected!', gestureData);
  // Initiate SOS
});

await GestureDetectionService.startDetection();
```

#### `LocationService.js`
High-accuracy GPS location with:
- Permission management
- High-accuracy GPS locks with timeout
- Fallback to last known location
- Reverse geocoding (get address)
- Background location tracking

```javascript
// Usage:
import LocationService from '../services/LocationService';

const location = await LocationService.getCurrentLocation({
  timeout: 30000,
  accuracy: Location.Accuracy.Highest,
});
// Returns: {latitude, longitude, accuracy, timestamp, isCached}
```

#### `SOSService.js`
SOS trigger and delivery with:
- 5-second silent countdown
- PIN verification for cancel
- Long-press detection for cancel
- Emergency contact notification (API/SMS)
- Offline retry queue
- 30-second post-SOS cooldown

```javascript
// Usage:
import SOSService from '../services/SOSService';

const result = await SOSService.initiateSOS({
  location: gpsData,
  userId: 'user123',
  countdownDuration: 5000,
  onCountdownTick: (remaining) => console.log(remaining),
  onSOSConfirmed: (sosData) => console.log('SOS sent!'),
});
```

#### `StorageService.js`
Secure state management using:
- `expo-secure-store` for native platforms (encrypted)
- `AsyncStorage` fallback with simple hashing
- Guardian Mode activation state
- Onboarding completion status
- User ID storage
- PIN storage

```javascript
// Usage:
import StorageService from '../services/StorageService';

await StorageService.setGuardianMode(true, userId);
const isEnabled = await StorageService.isGuardianModeEnabled();
await StorageService.setPIN('1234');
```

### Hook Layer

#### `useGestureDetection()`
React hook managing gesture detection lifecycle:

```javascript
const {
  isActive,
  tapCount,
  error,
  startDetection,
  stopDetection,
  resetDetection,
  simulateTap,
  getStatus,
} = useGestureDetection(onGestureDetected, {
  maxTapInterval: 600,
  requiredTaps: 3,
  cooldownPeriod: 30000,
});
```

#### `useGuardianMode(userId)`
React hook for Guardian Mode state:

```javascript
const {
  isEnabled,
  onboardingComplete,
  isLoading,
  error,
  toggleGuardianMode,
  completeOnboarding,
  canEnableGuardianMode,
} = useGuardianMode(userId);

// Check prerequisites
const { can, reason } = canEnableGuardianMode();

// Toggle
await toggleGuardianMode(true);
```

#### `useSOSFlow(userId, options)`
React hook managing SOS confirmation and trigger:

```javascript
const {
  isSOSActive,
  countdownTime,
  countdownSeconds,
  canCancel,
  error,
  initiateSOSCountdown,
  cancelSOSWithPin,
  cancelSOSWithLongPress,
  processQueue,
} = useSOSFlow(userId, {
  countdownDuration: 5000,
  onSOSConfirmed: (data) => {},
  onSOSCancelled: (reason) => {},
});

// Initiate countdown
await initiateSOSCountdown();

// Cancel options
await cancelSOSWithPin('1234');
await cancelSOSWithLongPress();
```

### Component Layer

#### `SOSCountdownOverlay.js`
Visual feedback during SOS countdown:
- Animated countdown circle
- Haptic feedback on each second
- PIN entry modal
- Long-press detection
- Status messages and emergency info

#### `GuardianModeStatus.js`
Dashboard showing system status:
- Gesture detection state
- Location service readiness
- SOS status and cooldown
- Emergency contact count
- System integration checklist

---

## 🚀 Integration Guide

### Step 1: Enable Guardian Mode Globally

Update your `GuardianContext.js` or main provider:

```javascript
import { useGuardianMode } from './hooks/useGuardianMode';
import { useGestureDetection } from './hooks/useGestureDetection';
import { useSOSFlow } from './hooks/useSOSFlow';

export function GuardianProvider({ children }) {
  const [userId, setUserId] = useState(null);
  
  // Guardian Mode state
  const {
    isEnabled: isGuardianEnabled,
    toggleGuardianMode,
    completeOnboarding,
  } = useGuardianMode(userId);

  // Gesture detection
  const {
    startDetection: startGestureDetection,
    stopDetection: stopGestureDetection,
  } = useGestureDetection((gestureData) => {
    // Triple-tap detected - initiate SOS
    handleTripleTapDetected(gestureData);
  });

  // SOS Flow
  const {
    isSOSActive,
    countdownSeconds,
    initiateSOSCountdown,
    cancelSOSWithPin,
    cancelSOSWithLongPress,
  } = useSOSFlow(userId);

  // Auto-start gesture detection when Guardian is enabled
  useEffect(() => {
    if (isGuardianEnabled) {
      startGestureDetection().catch(console.error);
    } else {
      stopGestureDetection().catch(console.error);
    }
  }, [isGuardianEnabled]);

  // Handle triple-tap
  const handleTripleTapDetected = async () => {
    // Verify Guardian Mode still active
    if (!isGuardianEnabled) return;

    // Initiate SOS countdown
    await initiateSOSCountdown();
  };

  return (
    <GuardianContext.Provider
      value={{
        isGuardianEnabled,
        toggleGuardianMode,
        isSOSActive,
        countdownSeconds,
        cancelSOSWithPin,
        cancelSOSWithLongPress,
        completeOnboarding,
      }}
    >
      <SOSCountdownOverlay
        visible={isSOSActive}
        countdownSeconds={countdownSeconds}
        canCancel={true}
        onCancelWithPin={cancelSOSWithPin}
        onCancelWithLongPress={cancelSOSWithLongPress}
      />
      {children}
    </GuardianContext.Provider>
  );
}
```

### Step 2: Add Guardian Dashboard Screen

Create a new screen to display Guardian status:

```javascript
// src/screens/GuardianDashboardScreen.js
import GuardianModeStatus from '../components/GuardianModeStatus';
import { useContext } from 'react';

export function GuardianDashboardScreen() {
  const context = useContext(GuardianContext);

  return (
    <GuardianModeStatus
      isGuardianEnabled={context.isGuardianEnabled}
      onToggleGuardian={context.toggleGuardianMode}
      onManageContacts={() => navigation.navigate('ManageContacts')}
      onSimulateGesture={() => {
        // Test triple-tap
        GestureDetectionService.simulateTap();
      }}
    />
  );
}
```

### Step 3: Configure Emergency Contacts

```javascript
// Add emergency contact flow
import SOSService from '../services/SOSService';

async function addEmergencyContact() {
  await SOSService.addEmergencyContact({
    name: 'Mom',
    phone: '+1234567890',
    email: 'mom@email.com',
  });
}

async function getEmergencyContacts() {
  const contacts = await SOSService.getEmergencyContacts();
  console.log('Emergency contacts:', contacts);
}
```

### Step 4: Set Up SOS API Endpoint

Your backend should have an endpoint to receive SOS alerts:

```javascript
// POST /api/emergency/sos
// Body:
{
  type: 'sos_alert',
  userId: 'user123',
  timestamp: 1234567890,
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 25,
    timestamp: 1234567890
  },
  contacts: [
    { name: 'Mom', phone: '+1234567890', email: 'mom@email.com' }
  ]
}

// Response:
{ success: true, message: 'SOS alert received' }
```

---

## 🧪 Testing Strategy

### Unit Testing

```javascript
// Test gesture detection debouncing
describe('GestureDetectionService', () => {
  it('should detect triple-tap within 600ms', () => {
    GestureDetectionService.initialize(mockCallback);
    
    GestureDetectionService.registerTap();
    GestureDetectionService.registerTap();
    GestureDetectionService.registerTap();
    
    expect(mockCallback).toHaveBeenCalledWith({
      type: 'triple-tap',
      timestamp: expect.any(Number),
    });
  });

  it('should reject slow taps', () => {
    GestureDetectionService.initialize(mockCallback);
    
    GestureDetectionService.registerTap();
    jest.advanceTimersByTime(700);
    GestureDetectionService.registerTap();
    GestureDetectionService.registerTap();
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
```

### Integration Testing

```javascript
// Test full SOS flow
describe('SOS Flow', () => {
  it('should complete full SOS flow', async () => {
    // 1. Get location
    const location = await LocationService.getCurrentLocation();
    expect(location.latitude).toBeDefined();

    // 2. Initiate SOS
    const sosPromise = SOSService.initiateSOS({
      location,
      userId: 'test-user',
      countdownDuration: 100, // Short for testing
    });

    // 3. Verify countdown starts
    expect(SOSService.getStatus().isSOSActive).toBe(true);

    // 4. Wait for confirmation
    const result = await sosPromise;
    expect(result.status).toBe('confirmed');

    // 5. Verify cooldown
    expect(SOSService.isInCooldown()).toBe(true);
  });
});
```

### Manual Testing Checklist

- [ ] **Gesture Detection**
  - [ ] Triple-tap registered on back button
  - [ ] Taps counted correctly (shows 1/3, 2/3, 3/3)
  - [ ] Slow taps rejected
  - [ ] Cooldown prevents double-trigger

- [ ] **SOS Activation**
  - [ ] 5-second countdown starts
  - [ ] Countdown overlay visible
  - [ ] Haptic feedback on each second
  - [ ] Animation is smooth

- [ ] **PIN Cancellation**
  - [ ] Correct PIN cancels SOS
  - [ ] Incorrect PIN rejected with message
  - [ ] Cannot cancel after 1 second

- [ ] **Long-Press Cancellation**
  - [ ] 2-second press cancels SOS
  - [ ] Release before 2s doesn't cancel
  - [ ] Haptic feedback on success

- [ ] **Location Service**
  - [ ] Requests permission if needed
  - [ ] Acquires GPS within 10 seconds
  - [ ] Falls back to cached location
  - [ ] Shows accuracy in dashboard

- [ ] **Contact Notification**
  - [ ] API call sent with location
  - [ ] SMS fallback works if API fails
  - [ ] Retry queue processes on network recovery
  - [ ] Queue persists across app restarts

- [ ] **Edge Cases**
  - [ ] Works with screen off (Android)
  - [ ] Survives app backgrounding
  - [ ] Handles permission denial gracefully
  - [ ] Works without GPS signal
  - [ ] Handles airplane mode

- [ ] **Performance**
  - [ ] Gesture detection uses minimal CPU
  - [ ] Location lock doesn't drain battery
  - [ ] No memory leaks on repeated triggers
  - [ ] Cleanup on unmount

---

## 📊 Performance Optimization

### Gesture Detection
- **Event-based**: Uses back button listener, no polling
- **Accelerometer optional**: Disabled by default unless enabled
- **Debounced**: Clears stale taps after 600ms window
- **Cooldown period**: 30s between triggers prevents accidental doubles

### Location Service
- **Smart timeout**: Aborts after 30s if GPS lock fails
- **Fallback caching**: Uses last known location if current unavailable
- **Accuracy validation**: Warns if accuracy > 100m
- **Background compatible**: Can update in background (Android)

### SOS Delivery
- **Optimized payloads**: Lean JSON structure
- **Concurrent attempts**: API + SMS can run simultaneously
- **Retry logic**: Exponential backoff for failed attempts
- **Queue persistence**: Survives app restart

---

## 🔒 Security Considerations

### 1. State Encryption
- PIN stored in `expo-secure-store` (encrypted)
- User ID encrypted on native platforms
- AsyncStorage hash for fallback

### 2. Location Privacy
- Only retrieved when SOS triggered
- Not tracked continuously
- Cached for emergency use

### 3. Contact Data
- Stored locally (not synced to cloud)
- Encrypted with app credentials
- SMS numbers not logged

### 4. Cooldown Period
- 30-second SOS cooldown prevents abuse
- Gesture detection cooldown prevents false triggers
- User can't spam emergency services

### 5. Secure Delivery
- API uses HTTPS (enforce in backend)
- SMS contains minimal data
- Location timestamp prevents replay

---

## 🐛 Troubleshooting

### Gesture Detection Not Working

**Symptom**: Triple-tap not detected
- [ ] Verify back button listener is active
- [ ] Check Guardian Mode is enabled
- [ ] Ensure onboarding is complete
- [ ] Test with `GestureDetectionService.simulateTap()`
- [ ] Check cooldown status

### Location Not Acquiring

**Symptom**: "Location unavailable" error
- [ ] Verify location permission granted in Settings
- [ ] Ensure GPS is enabled
- [ ] Check Android Location Service is on
- [ ] Try outdoor for better signal
- [ ] Check accuracy threshold (default 50m)

### SOS Not Sending

**Symptom**: SOS triggered but contacts not notified
- [ ] Verify emergency contacts configured
- [ ] Check API endpoint is reachable
- [ ] Inspect SMS fallback availability
- [ ] Check offline queue in AsyncStorage
- [ ] Verify network permissions

### High Battery Drain

**Symptom**: Battery depletes quickly with Guardian enabled
- [ ] Disable accelerometer if not needed
- [ ] Check background location tracking interval
- [ ] Verify no continuous polling
- [ ] Monitor foreground service CPU usage
- [ ] Test with battery profiler

---

## 📱 Platform-Specific Notes

### Android
- ✅ Full background gesture detection possible
- ✅ SMS fallback fully supported
- ✅ Accelerometer tap detection available
- ✅ Wake lock prevents sleep during SOS
- ⚠️ Battery optimization may block background execution
- ⚠️ Doze mode may delay location acquisition

### iOS
- ✅ High-accuracy GPS + background updates
- ✅ MessageUI SMS delivery
- ⚠️ Background gesture detection NOT available
- ⚠️ Sensor access restricted in background
- ⚠️ "Always Allow" permission required for background
- ⚠️ App Store review required for justification

---

## 🔄 Database Models (Backend)

### SOS Alert Record
```javascript
{
  _id: ObjectId,
  userId: String,
  timestamp: Date,
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String (optional)
  },
  contacts: [
    {
      name: String,
      phone: String,
      email: String,
      notified: Boolean,
      deliveryMethod: String // 'api' or 'sms'
    }
  ],
  status: String, // 'pending', 'sent', 'acknowledged'
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📚 Additional Resources

- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Sensors Documentation](https://docs.expo.dev/versions/latest/sdk/sensors/)
- [Expo SMS Documentation](https://docs.expo.dev/versions/latest/sdk/sms/)
- [Android Background Execution](https://developer.android.com/training/scheduling/alarms)
- [iOS Background Location](https://developer.apple.com/documentation/corelocation/getting-the-user-s-location/using-the-significant-change-location-service)

---

## 📝 License

This implementation is part of GuardianX safety app. All code is proprietary.

---

## 🤝 Support

For issues, feature requests, or improvements:
1. Check the troubleshooting section
2. Review the testing strategy
3. Inspect logs with `console.log` statements
4. Test on physical device (emulator limitations)
5. Report issues with reproduction steps
