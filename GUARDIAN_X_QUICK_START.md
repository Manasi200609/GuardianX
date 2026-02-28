# GuardianX Triple-Tap SOS - Quick Start & Architecture

## 📁 Updated Project Structure

```
GuardianX/
├── mobile/
│   ├── src/
│   │   ├── services/
│   │   │   ├── GestureDetectionService.js      ✨ NEW
│   │   │   ├── LocationService.js              ✨ NEW
│   │   │   ├── SOSService.js                   ✨ NEW
│   │   │   ├── StorageService.js               ✨ NEW
│   │   │   ├── api.js                          (existing)
│   │   │   ├── emergencyFlow.js                (existing)
│   │   │   └── gestureDetection.js             (existing)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useGestureDetection.js          ✨ NEW
│   │   │   ├── useGuardianMode.js              ✨ NEW
│   │   │   └── useSOSFlow.js                   ✨ NEW
│   │   │
│   │   ├── components/
│   │   │   ├── SOSCountdownOverlay.js          ✨ NEW
│   │   │   ├── GuardianModeStatus.js           ✨ NEW
│   │   │   └── ... (existing components)
│   │   │
│   │   ├── screens/
│   │   │   └── ... (existing screens)
│   │   │
│   │   ├── context/
│   │   │   └── GuardianContext.js              (update with new setup)
│   │   │
│   │   └── App.js                              (integrate GuardianProvider)
│   │
│   ├── android/
│   │   └── app/
│   │       └── src/
│   │           └── main/
│   │               ├── AndroidManifest.xml     (update with permissions)
│   │               └── AndroidManifest_GUARDIAN_CONFIG.xml  ✨ NEW
│   │
│   ├── ios/
│   │   └── GuardianX/
│   │       ├── Info.plist                      (update with config)
│   │       └── Info_GUARDIAN_CONFIG.plist      ✨ NEW (template)
│   │
│   ├── package.json                            ✨ UPDATED
│   ├── README.md
│   └── eas.json
│
├── GUARDIAN_X_SETUP_GUIDE.md                   ✨ NEW (comprehensive guide)
├── GUARDIAN_X_IMPLEMENTATION_EXAMPLES.js       ✨ NEW (code examples)
├── GUARDIAN_X_QUICK_START.md                   ✨ NEW (this file)
│
└── Backend/
    ├── routes/
    │   └── emergencyRoutes.js                  (add /api/emergency/sos)
    └── ... (existing backend code)
```

---

## ⚡ Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd mobile
npm install
# or: yarn install
```

**New packages added:**
- `@react-native-async-storage/async-storage` - State persistence
- `expo-location` - GPS with high accuracy  
- `expo-secure-store` - Encrypted storage
- `expo-sensors` - Accelerometer detection
- `expo-sms` - SMS fallback
- `expo-contacts` - Contact management

### 2. Update App.js or Main Context
```javascript
import { GuardianProvider } from './src/context/GuardianContext';

export default function App() {
  return (
    <GuardianProvider userId={userId}>
      {/* Your app navigation */}
    </GuardianProvider>
  );
}
```

### 3. Add Guardian Dashboard Screen
```javascript
import GuardianModeStatus from './src/components/GuardianModeStatus';

export function GuardianDashboardScreen() {
  return (
    <GuardianModeStatus
      isGuardianEnabled={isEnabled}
      onToggleGuardian={handleToggle}
      onManageContacts={handleManageContacts}
      onSimulateGesture={handleTest}
    />
  );
}
```

### 4. Add to Your Backend
```javascript
// POST /api/emergency/sos
app.post('/api/emergency/sos', async (req, res) => {
  const { userId, location, contacts, timestamp } = req.body;
  
  // 1. Log SOS alert
  await SOSAlert.create({
    userId,
    location,
    contacts,
    timestamp,
  });
  
  // 2. Send notifications
  for (const contact of contacts) {
    // Email, SMS, or push notification
    await notifyContact(contact, location);
  }
  
  res.json({ success: true });
});
```

### 5. Test Triple-Tap
- Enable Guardian Mode
- Add emergency contact
- Triple-tap back button or use "Test Triple-Tap" button
- See 5-second countdown overlay
- Cancel with PIN or 2-second long-press

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      REACT NATIVE APP                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            GuardianProvider (Context)                │  │
│  │  - Manages Guardian Mode state                       │  │
│  │  - Coordinates all services                          │  │
│  │  - Renders SOS overlay                               │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│     ┌───────────────────┼───────────────────┐               │
│     │                   │                   │               │
│     ▼                   ▼                   ▼               │
│  ┌─────────┐      ┌──────────────┐   ┌──────────┐          │
│  │  Hooks  │      │  Components  │   │ Screens  │          │
│  │         │      │              │   │          │          │
│  │ • use   │      │ • SOS Overlay│   │ • Guard. │          │
│  │   Gesture     │ • GuardianMode   │   Dashboard       │
│  │   Detection   │   Status         │ • Settings       │
│  │             │ • ...          │ • ...       │          │
│  │ • use       │              │          │          │
│  │   GuardianMode     │              │          │          │
│  │             │              │          │          │
│  │ • use       │              │          │          │
│  │   SOSFlow   │              │          │          │
│  └─────┬───────┘              │          │          │
│        │                      │          │          │
└────────┼──────────────────────┼──────────┼──────────┘
         │                      │          │
         └──────────────────────┼──────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
                    ▼                        ▼
         ┌────────────────────┐  ┌────────────────────┐
         │   SERVICE LAYER    │  │   STORAGE LAYER    │
         ├────────────────────┤  ├────────────────────┤
         │                    │  │                    │
         │ • Gesture          │  │ • AsyncStorage     │
         │   Detection        │  │ • SecureStore      │
         │                    │  │                    │
         │ • Location         │  │ Guardian Mode      │
         │   Service          │  │ • User ID          │
         │                    │  │ • PIN              │
         │ • SOS              │  │ • Contacts         │
         │   Service          │  │ • Location Cache   │
         │                    │  │ • SOS Queue        │
         └────────┬───────────┘  └────────────────────┘
                  │
      ┌───────────┴────────────┐
      │                        │
      ▼                        ▼
  ┌─────────────┐      ┌──────────────────┐
  │   NATIVE    │      │   BACKEND API    │
  ├─────────────┤      ├──────────────────┤
  │             │      │                  │
  │ • Back      │      │ POST /sos        │
  │   Button    │      │ (Send alert)     │
  │   Handler   │      │                  │
  │             │      │ GET /contacts    │
  │ • Accel.    │      │ (List contacts)  │
  │   Sensor    │      │                  │
  │             │      │ SEND SMS         │
  │ • GPS       │      │ (Fallback)       │
  │   Lock      │      │                  │
  │             │      │ Store SOS        │
  │ • SMS       │      │ Alert in DB      │
  │             │      │                  │
  └─────────────┘      └──────────────────┘
```

---

## 🔄 Data Flow

### Triple-Tap Detection Flow
```
User Triple-Taps Back Button
        │
        ▼
BackHandler.addEventListener() triggered
        │
        ▼
GestureDetectionService.registerTap() called
        │
        ├─ Record timestamp
        ├─ Vibrate haptic feedback
        │
        ▼
Check if 3 taps within 600ms
        │
   ┌────┴────┐
   │          │
   NO        YES
   │          │
   │          ▼
   │    Clear cooldown check
   │          │
   │          ▼
   │    Trigger callback
   │          │
   └──────────┼──────────────────────┐
              │                      │
              ▼                      ▼
    If Guardian Mode ON    If Guardian Mode OFF
    & Onboarding Done           │
         │                      │
         ▼                      ▼
    Initiate SOS            Ignore gesture
      Countdown
```

### SOS Confirmation Flow
```
initiateSOS() Called
        │
        ├─ Get location (timeout: 30s)
        ├─ Start 5-second countdown
        │
        ▼
Display SOSCountdownOverlay
        │
    ┌───┴───────────────────────┐
    │                           │
    ▼                           ▼
Countdown Reaches 0      User Cancels
        │                       │
        ├─────┬─────────────────┤
        │     │                 │
    Method 1: PIN            Method 2: Long-Press
   (Show Modal)             (2 second hold)
        │                       │
        ├─ Verify PIN      Trigger cancel
        │ against stored      callback
        │ value
        │                       │
        ├───────┬───────────────┤
        │       │               │
    VALID   INVALID           │
        │       │               │
        │       │               │
        ▼       ▼               ▼
      Continue  Reject      Clear State
      (fall     (show       Return to
      through   error)      normal mode
      to
      automatic
      send)
        │
        ▼
SendSOSAlert()
        │
        ├─ Get EmergencyContacts
        ├─ Format message
        │
        ▼
Send via API (async)
        │
    ┌───┴────────┐
    │            │
 SUCCESS      FAILURE
    │            │
    │            ▼
    │       Queue for retry
    │       (localStorage)
    │            │
    └────────────┤
             │
             ▼
       If SMS fallback enabled:
       Send via SMS
             │
             ├─ Success: Log
             └─ Failure: Queue
```

---

## 📊 State Machine

### Guardian Mode States
```
┌─────────────┐
│   LOCKED    │  (No Guardian Mode)
└──────┬──────┘
       │ completeOnboarding()
       ▼
┌──────────────┐
│ ONBOARDED    │  (Ready to enable)
└──────┬───────┘
       │ toggleGuardianMode(true)
       │ & Location/Contact check
       ▼
┌──────────────┐
│   ACTIVE     │  (Listening for gestures)
└──────┬───────┘
       │ toggleGuardianMode(false)
       ▼
┌──────────────┐
│   INACTIVE   │  (Services stopped)
└──────────────┘
```

### SOS States
```
┌──────────────┐
│   READY      │  (Waiting for gesture)
└──────┬───────┘
       │ Triple-tap detected
       │ initiateSOS()
       ▼
┌──────────────────┐
│  COUNTDOWN       │  (5-second timer)
│  (Cancellable)   │
└──────┬───────────┘
       │
   ┌───┼───┐
   │       │
   ▼       ▼
SENT    CANCELLED
   │       │
   └───┬───┘
       │ After 30s cooldown
       ▼
    READY
```

---

## 🎯 Key Features Implementation

### Feature: Triple-Tap Detection
**Service**: `GestureDetectionService.js`
- Event-based back button listener
- Timestamp tracking with 600ms window
- Debouncing with 30s cooldown
- Haptic feedback
- Accelerometer optional

### Feature: 5-Second Countdown
**Service + Component**: `SOSService.js` + `SOSCountdownOverlay.js`
- Silent countdown (no audio)
- Animated circular progress
- Per-second vibration
- Haptic feedback

### Feature: PIN Cancellation
**Service + Component**: `SOSService.js` + `SOSCountdownOverlay.js`
- PIN verified against `StorageService`
- Error message on wrong PIN
- Cannot verify after 1 second

### Feature: Long-Press Cancellation
**Component**: `SOSCountdownOverlay.js`
- 2-second continuous press required
- Release before 2s doesn't trigger
- Haptic feedback on success
- Cannot use after 1 second

### Feature: GPS Location Capture
**Service**: `LocationService.js`
- Requests permission on demand
- High-accuracy GPS lock
- 30-second timeout with fallback
- Caches last known location
- Reverse geocoding support

### Feature: Contact Notification
**Service**: `SOSService.js`
- API delivery (primary)
- SMS fallback on network failure
- Formatted message with maps link
- Retry queue with persistence
- 30-second SOS cooldown

---

## 🧪 Test Scenarios

### Scenario 1: Basic SOS Trigger
```
1. Enable Guardian Mode
2. Add emergency contact
3. Triple-tap back button
4. Observe 5-second countdown
5. Wait for auto-send
6. Verify contact notification received
```

### Scenario 2: PIN Cancellation
```
1. Triple-tap to trigger SOS
2. Tap "Cancel with PIN"
3. Enter incorrect PIN → See error
4. Enter correct PIN → SOS cancelled
5. Verify no notification sent
```

### Scenario 3: Long-Press Cancellation
```
1. Triple-tap to trigger SOS
2. Press & hold cancel button
3. Release after 2 seconds → SOS cancelled
4. Release before 2 seconds → Nothing happens
5. After 1 second remaining → Button disabled
```

### Scenario 4: Network Failure Handling
```
1. Triple-tap to trigger SOS
2. Disconnect network during countdown
3. Wait for countdown to complete
4. Observe "Failed to send, will retry" message
5. Reconnect network
6. Verify queued SOS is sent
```

### Scenario 5: Background Execution
```
1. Enable Guardian Mode
2. Triple-tap
3. Minimize app
4. SOS countdown should continue
5. Even with screen off (Android)
```

---

## 🔐 Security Checklist

- [x] PIN encrypted with `expo-secure-store`
- [x] Location only sent on SOS trigger
- [x] Contact data stored locally (encrypted)
- [x] API uses HTTPS (backend responsibility)
- [x] 30-second cooldown prevents spam
- [x] User ID stored securely
- [x] Onboarding requirement before activation
- [x] Guardian Mode requires explicit toggle
- [x] Permission checks before location access

---

## 📞 Integration Checklist

- [ ] Copy service files to `src/services/`
- [ ] Copy hook files to `src/hooks/`
- [ ] Copy component files to `src/components/`
- [ ] Update `package.json` with new dependencies
- [ ] Run `npm install`
- [ ] Update `AndroidManifest.xml` with permissions
- [ ] Update `ios/Info.plist` with configuration
- [ ] Create SOS endpoint in backend (`POST /api/emergency/sos`)
- [ ] Update `GuardianContext.js` with new setup
- [ ] Add routing to Guardian Dashboard screen
- [ ] Test on physical Android device
- [ ] Test on physical iOS device (if applicable)
- [ ] Test all cancellation methods
- [ ] Test network failure recovery
- [ ] Test with battery saver enabled
- [ ] Test with location disabled

---

## 📞 Support & Debugging

### Enable Debug Logging
All services log their activities. Check console:
```javascript
// Services automatically log with prefixes:
// ✅ = Success
// ❌ = Error  
// ⚠️ = Warning
// 🎯 = Gesture events
// 📍 = Location events
// 🚨 = SOS events
// ⏸️  = Cooldown/rate limit
```

### Common Issues

**Q: Triple-tap not detected**
```javascript
// Check:
1. Guardian Mode is enabled
2. User is logged in
3. Onboarding is complete
4. Not in cooldown period (30s)
5. Use GestureDetectionService.getStatus() to debug
```

**Q: Location not acquiring**
```javascript
// Check:
1. Location permission granted
2. GPS enabled on device
3. Outdoor with clear sky
4. Use LocationService.getStatus() to debug
5. Check network connectivity
```

**Q: Contacts not notified**
```javascript
// Check:
1. Contacts added and stored
2. Network connectivity
3. Backend SOS endpoint exists
4. Check SOS queue: AsyncStorage/@guardian_sos_queue
5. Use SOSService.getStatus() to debug
```

---

## 🌟 Performance Tips

1. **Gesture Detection**: Event-based, minimal overhead
2. **Location Lock**: Timeout prevents hanging (30s max)
3. **SOS Delivery**: Async, doesn't block UI
4. **Retry Queue**: Processes in background
5. **Memory**: All subscriptions cleaned up on unmount

---

## 📚 Related Documentation

- [Setup Guide](./GUARDIAN_X_SETUP_GUIDE.md) - Comprehensive guide
- [Implementation Examples](./GUARDIAN_X_IMPLEMENTATION_EXAMPLES.js) - Real code samples
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Sensors Docs](https://docs.expo.dev/versions/latest/sdk/sensors/)
- [Android Background Execution](https://developer.android.com/training/scheduling/)

---

## 🎓 Summary

GuardianX Triple-Tap SOS system provides:
- ✅ Reliable gesture detection (event-based, no polling)
- ✅ Safe confirmation flow (5-second countdown)
- ✅ Multiple cancellation methods (PIN + long-press)
- ✅ High-accuracy GPS location
- ✅ Resilient contact notification (API + SMS)
- ✅ Offline support with retry
- ✅ Secure state management
- ✅ Production-ready error handling
- ✅ Comprehensive edge case coverage
- ✅ Battery-efficient implementation

**Ready to deploy. Test thoroughly on devices before production.**
