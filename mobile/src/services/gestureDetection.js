// src/services/gestureDetection.js
// Real MediaPipe Hand Gesture Detection Service
// Integrates with WebView for camera-based detection
// IMPORTANT: This service only detects gestures and notifies callbacks
// Emergency triggering is handled by GuardianContext

import { Camera } from 'expo-camera';

class GestureDetectionService {
  constructor() {
    this.isDetecting = false;
    this.fistDetectedStartTime = null;
    this.FIST_HOLD_DURATION = 3000; // 3 seconds
    this.onEmergencyDetected = null;
    this.mediaPipeWebViewRef = null;
  }

  initialize(onEmergencyCallback) {
    this.onEmergencyDetected = onEmergencyCallback;
    console.log('✅ Gesture Detection Service initialized with callback');
  }

  async startDetection() {
    if (this.isDetecting) {
      console.log('⚠️ Gesture detection already running');
      return;
    }

    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      this.isDetecting = true;
      this.fistDetectedStartTime = null;
      
      console.log('🎯 Gesture detection started');
      console.log('📋 Emergency gesture: Clenched fist held for 3 seconds');
    } catch (error) {
      console.error('❌ Failed to start gesture detection:', error);
      this.isDetecting = false;
      throw error;
    }
  }

  stopDetection() {
    if (!this.isDetecting) {
      return;
    }

    this.isDetecting = false;
    this.fistDetectedStartTime = null;
    console.log('🛑 Gesture detection stopped');
  }

  setWebViewRef(ref) {
    this.mediaPipeWebViewRef = ref;
  }

  /**
   * Handle MediaPipe detection result from WebView
   * Called when MediaPipe detects hand landmarks
   * 
   * IMPORTANT: This function ONLY processes MediaPipe results
   * Emergency flow is triggered by GuardianContext callback
   */
  handleMediaPipeResult(result) {
    if (!this.isDetecting) {
      console.log('⚠️ Detection not active, ignoring result');
      return;
    }

    console.log('📊 Processing MediaPipe result:', result);

    // Result from mediapipe.html contains:
    // { type: 'emergency', gesture: 'fist', landmarks: [...] }
    // OR
    // { gesture: 'fist'|'open_palm'|'unknown', confidence: 0.95, ... }
    
    if (result.type === 'emergency') {
      console.log('🚨 EMERGENCY GESTURE DETECTED - Fist held for 3 seconds!');
      
      // IMPORTANT: Only notify the callback, don't call emergency flow here
      // GuardianContext will handle calling emergencyFlow.triggerEmergency()
      if (this.onEmergencyDetected) {
        this.onEmergencyDetected({
          gesture: result.gesture,
          landmarks: result.landmarks,
          detectedAt: new Date(),
        });
      } else {
        console.error('❌ No emergency callback registered!');
      }
    } else if (result.gesture === 'fist') {
      const now = Date.now();
      
      if (!this.fistDetectedStartTime) {
        this.fistDetectedStartTime = now;
        console.log('👊 Fist detected, holding... (need to hold for 3 seconds)');
      } else {
        const holdDuration = now - this.fistDetectedStartTime;
        console.log(`⏱️ Holding fist for ${(holdDuration / 1000).toFixed(1)}s`);
      }
    } else if (result.gesture) {
      // Different gesture detected
      if (this.fistDetectedStartTime) {
        console.log('👊 Fist released, resetting timer');
        this.fistDetectedStartTime = null;
      }
    }
  }
}

const gestureDetectionService = new GestureDetectionService();

export default gestureDetectionService;