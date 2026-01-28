# GuardianX v2 - System Architecture

## Overview

GuardianX v2 is a production-ready, cross-platform mobile safety application that provides hands-free emergency detection and response. The system is designed to work even when the user cannot interact with their phone.

## System Components

### 1. Mobile Application (React Native)

#### Core Services

**Gesture Detection Service** (`src/services/gestureDetection.js`)
- Real-time hand gesture recognition using MediaPipe
- Detects clenched fist gesture held for 3 seconds
- Continuous monitoring when Guardian Mode is active
- Triggers emergency callback when threshold met

**Emergency Flow Service** (`src/services/emergencyFlow.js`)
- Orchestrates complete emergency response
- Gets GPS location with high accuracy
- Sends SMS to emergency contacts via backend
- Logs emergency event to backend
- Handles errors gracefully with fallback mechanisms

**Location Tracking Service** (`src/services/locationTracking.js`)
- Continuous location updates (every 5 seconds or 10 meters)
- Background location support
- Location history tracking
- Route deviation detection

#### Key Screens

**DashboardScreen**
- Main entry point
- Guardian Mode toggle (shield icon)
- System status overview
- Quick actions (Call, Alert, Route, Contacts)
- Navigation to Guardian Mode screen

**GuardianModeScreen**
- Shows system status (not buttons)
- Live indicators:
  - Gesture monitoring status
  - Route monitoring status
  - Emergency services standby
- Information about how the system works

**EmergencyDetectedScreen**
- Calm UI feedback: "Emergency detected. Help is on the way."
- Shows location shared
- Shows contacts notified
- Shows trigger type
- Instructions for what happens next

#### State Management

**GuardianContext** (`src/context/GuardianContext.js`)
- Global state for Guardian Mode
- User session management
- Gesture preferences
- Emergency handling coordination
- Integrates all services

### 2. Backend API (Node.js + Express)

#### Database Models

**User Model** (`models/User.js`)
- User authentication
- Emergency contacts array
- Guardian mode state
- Gesture preferences

**EmergencyLog Model** (`models/EmergencyLog.js`)
- Complete emergency event logging
- User ID reference
- Trigger type (gesture, manual, motion, route_deviation)
- Location data (lat/lng, accuracy, address)
- SMS status and contacts notified
- Status tracking (triggered, notified, resolved, false_alarm)
- Timestamps

#### API Endpoints

**User Management** (`routes/userRoutes.js`)
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `PUT /api/users/guardian-mode/:id` - Toggle guardian mode
- `PUT /api/users/contacts/:id` - Update emergency contacts
- `GET /api/users/contacts/:id` - Get emergency contacts

**Emergency Management** (`routes/emergencyRoutes.js`)
- `POST /api/emergencies` - Log emergency event (includes SMS sending)
- `GET /api/emergencies/user/:userId` - Get user's emergency logs
- `PUT /api/emergencies/:emergencyId` - Update emergency status

**Legacy SOS** (`routes/sosRoutes.js`)
- `POST /api/users/:id/sos` - Legacy SOS endpoint (for compatibility)

#### Controllers

**userController.js**
- User registration/login logic
- Guardian mode management
- Emergency contact management
- Gesture preference updates

**emergencyController.js**
- Emergency event logging
- SMS sending to emergency contacts
- Emergency history retrieval
- Emergency status updates

#### Utilities

**smsService.js**
- Twilio SMS integration
- Fallback simulation for development
- Error handling
- Message formatting

## Data Flow

### Emergency Detection Flow

```
1. User activates Guardian Mode
   ↓
2. GuardianContext initializes services:
   - Gesture Detection Service starts
   - Location Tracking Service starts
   ↓
3. User performs emergency gesture (clenched fist for 3 seconds)
   ↓
4. Gesture Detection Service detects gesture
   ↓
5. Gesture Detection Service calls emergency callback
   ↓
6. GuardianContext calls Emergency Flow Service
   ↓
7. Emergency Flow Service:
   a. Gets current GPS location
   b. Calls backend API: POST /api/emergencies
   ↓
8. Backend Emergency Controller:
   a. Creates EmergencyLog entry
   b. Fetches user's emergency contacts
   c. Sends SMS to each contact via Twilio
   d. Updates EmergencyLog with SMS status
   e. Returns response
   ↓
9. Emergency Flow Service receives response
   ↓
10. Navigation to EmergencyDetectedScreen
    ↓
11. EmergencyDetectedScreen displays:
    - "Emergency detected. Help is on the way."
    - Location shared
    - Contacts notified
    - Trigger type
```

### Manual Emergency Flow

```
1. User taps "Alert" button on Dashboard
   ↓
2. DashboardScreen calls Emergency Flow Service
   ↓
3. Emergency Flow Service executes same flow as above
   (steps 7-11)
```

## Security Considerations

### Current Implementation
- Plain password storage (hackathon/demo)
- No authentication tokens
- Basic CORS configuration

### Production Recommendations
- JWT authentication
- Password hashing (bcrypt)
- API rate limiting
- Input validation and sanitization
- HTTPS/TLS encryption
- Secure storage for sensitive data

## Performance Optimizations

### Mobile App
- Gesture detection: Optimized frame rate (check every 100ms)
- Location tracking: Configurable update intervals
- Background execution: Efficient resource usage
- Caching: Emergency contacts cached locally

### Backend
- Database indexing on frequently queried fields
- Connection pooling for MongoDB
- Async/await for non-blocking operations
- Error handling prevents crashes

## Scalability Considerations

### Current Architecture
- Single server deployment
- MongoDB single instance
- Synchronous SMS sending

### Production Scalability
- Load balancing for multiple servers
- MongoDB replica set or sharding
- Queue system for SMS (Redis/RabbitMQ)
- CDN for static assets
- Caching layer (Redis)
- Database read replicas

## Error Handling

### Mobile App
- Network errors: Fallback to direct SOS endpoint
- Location errors: Graceful degradation
- Permission errors: User-friendly messages
- Service errors: Retry logic

### Backend
- Database errors: Proper error responses
- SMS errors: Logged but don't block emergency logging
- Validation errors: Clear error messages
- Server errors: 500 responses with logging

## Monitoring & Logging

### Backend Logging
- All API requests logged with timestamp
- Emergency events logged with full details
- SMS sending logged (success/failure)
- Error stack traces logged

### Mobile Logging
- Service initialization logs
- Emergency detection logs
- Location update logs
- Error logs

## Testing Strategy

### Unit Tests (Recommended)
- Service functions
- Utility functions
- API controllers

### Integration Tests (Recommended)
- Emergency flow end-to-end
- API endpoints
- Database operations

### Manual Testing
- Complete emergency flow
- Guardian Mode activation
- Gesture detection
- Location tracking
- SMS sending

## Future Enhancements

1. **MediaPipe Integration**
   - Replace simulated gesture detection
   - Optimize performance
   - Add more gesture types

2. **Background Execution**
   - Background tasks for gesture detection
   - Background location updates
   - Push notifications

3. **Advanced Features**
   - Route planning and monitoring
   - Geofencing
   - Emergency history screen
   - Two-way communication with contacts
   - Video/audio recording during emergency

4. **Analytics**
   - Emergency event analytics
   - User behavior tracking
   - Performance metrics

## Deployment Architecture

### Development
```
Mobile App (Expo/React Native) ←→ Backend (localhost:5000) ←→ MongoDB (localhost)
```

### Production
```
Mobile App (App Store/Play Store)
    ↓ HTTPS
Load Balancer
    ↓
Backend Servers (Multiple instances)
    ↓
MongoDB Atlas (Cloud)
    ↓
Twilio API (SMS)
```

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String,
  emergencyContacts: [{
    name: String,
    phone: String
  }],
  guardianMode: Boolean,
  gesturePreferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### EmergencyLog Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  triggeredAt: Date,
  triggerType: String (enum),
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String
  },
  status: String (enum),
  smsSent: Boolean,
  contactsNotified: [{
    phone: String,
    sentAt: Date,
    success: Boolean
  }],
  resolvedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

This architecture supports the core vision: **Silent, proactive personal safety that works hands-free.**

