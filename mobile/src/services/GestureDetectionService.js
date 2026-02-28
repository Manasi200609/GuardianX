/**
 * GestureDetectionService.js
 * 
 * Production-grade triple-tap gesture detection system for Android/iOS
 * 
 * Features:
 * - Triple-tap detection (back button or screen)
 * - Configurable tap interval (default 600ms)
 * - Debouncing to prevent false positives
 * - Battery-efficient event-based detection
 * - Proper cleanup and memory management
 * - Error handling and logging
 * - No constant polling (event-driven)
 */

import { AppState, BackHandler, Vibration, Platform } from 'react-native';
import * as ExpoSensors from 'expo-sensors';

class GestureDetectionService {
  constructor() {
    this.tapTimestamps = [];
    this.debounceTimeout = null;
    this.appState = new AppState();
    this.isActive = false;
    this.isListening = false;
    this.callback = null;
    this.maxTapInterval = 600; // Max milliseconds between taps
    this.requiredTaps = 3; // Number of taps to detect
    this.lastTriggerTime = 0;
    this.cooldownPeriod = 30000; // 30 second cooldown after trigger
    this.accelerometerSubscription = null;
    this.appStateSubscription = null;
    this.backHandlerSubscription = null;
    
    // Sensor calibration for tap detection via accelerometer
    this.tapThreshold = 20; // Adjust based on testing
    this.lastAccelerometerTime = 0;
    this.minTapInterval = 100; // Minimum ms between detected taps
  }

  /**
   * Initialize the gesture detection service
   * @param {Function} callback - Function to call when triple-tap is detected
   * @param {Object} options - Configuration options
   */
  initialize(callback, options = {}) {
    if (this.isListening) {
      console.warn('GestureDetectionService already initialized');
      return;
    }

    this.callback = callback;
    this.maxTapInterval = options.maxTapInterval || 600;
    this.requiredTaps = options.requiredTaps || 3;
    this.cooldownPeriod = options.cooldownPeriod || 30000;
    this.tapThreshold = options.tapThreshold || 20;

    console.log('✅ GestureDetectionService initialized', {
      maxTapInterval: this.maxTapInterval,
      requiredTaps: this.requiredTaps,
      cooldownPeriod: this.cooldownPeriod,
    });

    this.isListening = true;
  }

  /**
   * Start listening for triple-tap gestures
   */
  async startDetection() {
    if (!this.isListening) {
      console.warn('GestureDetectionService not initialized');
      return;
    }

    if (this.isActive) {
      console.warn('Gesture detection already active');
      return;
    }

    try {
      // Setup back button handler (Android primarily)
      if (Platform.OS === 'android') {
        this.backHandlerSubscription = BackHandler.addEventListener(
          'hardwareBackPress',
          this.handleBackPress.bind(this)
        );
      }

      // Setup app state listener for context switches
      this.appStateSubscription = AppState.addEventListener(
        'change',
        this.handleAppStateChange.bind(this)
      );

      // For accelerometer-based detection (supplementary)
      if (Platform.OS === 'android') {
        await this.setupAccelerometerDetection();
      }

      this.isActive = true;
      console.log('🎯 Gesture detection started');
    } catch (error) {
      console.error('❌ Failed to start gesture detection:', error);
      throw error;
    }
  }

  /**
   * Setup accelerometer for tap detection via device motion
   * This provides supplementary detection on Android
   */
  async setupAccelerometerDetection() {
    try {
      // Set accelerometer update interval to 100ms for responsiveness
      await ExpoSensors.Accelerometer.setUpdateInterval(100);

      this.accelerometerSubscription = ExpoSensors.Accelerometer.addListener(
        ({ x, y, z }) => {
          // Calculate magnitude of acceleration
          const magnitude = Math.sqrt(x * x + y * y + z * z);

          // Detect sharp movement (potential tap)
          // Device at rest has magnitude ~9.8 (gravity)
          // Tap creates deviation from baseline
          const deviation = Math.abs(magnitude - 9.8);

          if (deviation > this.tapThreshold) {
            const now = Date.now();
            // Only register one tap per minimum interval
            if (now - this.lastAccelerometerTime > this.minTapInterval) {
              this.lastAccelerometerTime = now;
              this.registerTap('accelerometer');
            }
          }
        }
      );
    } catch (error) {
      console.warn('⚠️ Accelerometer setup failed (optional):', error);
      // This is optional, don't fail completely
    }
  }

  /**
   * Handle back button press (Android)
   * @returns {boolean} - True to prevent default back behavior on triple-tap
   */
  handleBackPress() {
    this.registerTap('backbutton');
    
    // Return true to consume the back press on triple-tap detection
    if (this.tapTimestamps.length >= this.requiredTaps) {
      return true;
    }
    return false;
  }

  /**
   * Register a tap and check if triple-tap threshold is met
   * @param {string} source - Source of tap (backbutton, accelerometer, manual)
   */
  registerTap(source = 'unknown') {
    const now = Date.now();

    // Check cooldown period
    if (now - this.lastTriggerTime < this.cooldownPeriod) {
      console.log('⏸️  Gesture in cooldown period, ignoring tap');
      return;
    }

    // Remove old taps outside the window
    this.tapTimestamps = this.tapTimestamps.filter(
      (timestamp) => now - timestamp < this.maxTapInterval
    );

    // Add current tap
    this.tapTimestamps.push(now);

    console.log(
      `📍 Tap registered (${source}): ${this.tapTimestamps.length}/${this.requiredTaps}`
    );

    // Provide haptic feedback on each tap
    this.provideFeedback(this.tapTimestamps.length);

    // Check if triple-tap threshold is reached
    if (this.tapTimestamps.length >= this.requiredTaps) {
      // Clear taps and trigger gesture
      this.tapTimestamps = [];
      this.lastTriggerTime = now;
      this.triggerGesture();

      // Clear debounce timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      return;
    }

    // Reset taps if they expire
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      if (this.tapTimestamps.length < this.requiredTaps) {
        console.log('⏱️  Taps expired, resetting');
        this.tapTimestamps = [];
      }
    }, this.maxTapInterval);
  }

  /**
   * Trigger the gesture callback
   */
  triggerGesture() {
    if (this.callback) {
      console.log('🎯 TRIPLE-TAP DETECTED - Triggering gesture callback');
      
      try {
        this.callback({
          type: 'triple-tap',
          timestamp: Date.now(),
          tapCount: this.requiredTaps,
          detectionMethod: 'backbutton/accelerometer',
        });
      } catch (error) {
        console.error('❌ Error in gesture callback:', error);
      }
    }
  }

  /**
   * Provide haptic feedback to user
   * @param {number} tapCount - Number of taps
   */
  provideFeedback(tapCount) {
    try {
      // Vibrate on each tap
      const pattern = tapCount === 1 ? 100 : tapCount === 2 ? [100, 50, 100] : [100, 50, 100, 50, 100];
      Vibration.vibrate(pattern, false);
    } catch (error) {
      console.warn('⚠️ Vibration feedback failed:', error);
    }
  }

  /**
   * Handle app state changes (foreground/background)
   * @param {string} state - 'active', 'background', 'inactive'
   */
  handleAppStateChange(state) {
    console.log('📱 App state changed:', state);

    if (state === 'background') {
      console.log('📴 App backgrounded - gesture detection limited');
      // Gesture detection continues on Android with native module
      // iOS has stricter background limitations
    } else if (state === 'active') {
      console.log('📱 App foregrounded - gesture detection active');
    }
  }

  /**
   * Stop listening for gesture
   */
  async stopDetection() {
    if (!this.isActive) {
      console.warn('Gesture detection not active');
      return;
    }

    try {
      // Cleanup accelerometer
      if (this.accelerometerSubscription) {
        this.accelerometerSubscription.remove();
        this.accelerometerSubscription = null;
      }

      // Cleanup back handler
      if (this.backHandlerSubscription) {
        this.backHandlerSubscription.remove();
        this.backHandlerSubscription = null;
      }

      // Cleanup app state listener
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      // Clear debounce timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }

      // Clear tap timestamps
      this.tapTimestamps = [];

      this.isActive = false;
      console.log('🛑 Gesture detection stopped');
    } catch (error) {
      console.error('❌ Error stopping gesture detection:', error);
    }
  }

  /**
   * Manually register a tap (for testing or manual override)
   */
  simulateTap() {
    console.log('🧪 Simulating tap for testing');
    this.registerTap('manual');
  }

  /**
   * Reset the detection state (useful for cancelling detection)
   */
  reset() {
    this.tapTimestamps = [];
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    console.log('🔄 Gesture detection reset');
  }

  /**
   * Get current detection status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      isListening: this.isListening,
      currentTaps: this.tapTimestamps.length,
      requiredTaps: this.requiredTaps,
      timeUntilCooldown: Math.max(
        0,
        this.cooldownPeriod - (Date.now() - this.lastTriggerTime)
      ),
      inCooldown: Date.now() - this.lastTriggerTime < this.cooldownPeriod,
    };
  }

  /**
   * Cleanup and destroy service
   */
  destroy() {
    this.stopDetection();
    this.callback = null;
    this.tapTimestamps = [];
    this.isListening = false;
    console.log('🗑️ GestureDetectionService destroyed');
  }
}

// Export singleton instance
export default new GestureDetectionService();
