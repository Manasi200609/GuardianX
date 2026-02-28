/**
 * useSOSFlow.js
 * 
 * React hook for managing SOS activation and confirmation flow
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import SOSService from '../services/SOSService';
import LocationService from '../services/LocationService';
import StorageService from '../services/StorageService';

/**
 * Hook to manage SOS flow (countdown, confirmation, cancellation)
 * @param {string} userId - Current user ID
 * @param {Object} options - Configuration options
 * @returns {Object} - SOS flow state and controls
 */
export const useSOSFlow = (userId, options = {}) => {
  const {
    countdownDuration = 5000, // 5 seconds
    onSOSConfirmed = null,
    onSOSCancelled = null,
  } = options;

  const [isSOSActive, setIsSOSActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);
  const [canCancel, setCanCancel] = useState(true);
  const [error, setError] = useState(null);
  const sosDataRef = useRef(null);

  // Initialize location service
  useEffect(() => {
    const initLocation = async () => {
      try {
        // Request location permissions if not already granted
        const hasPermission = await LocationService.checkPermissions();
        if (!hasPermission) {
          console.log('📍 Requesting location permissions...');
          await LocationService.requestPermissions();
        }
      } catch (err) {
        console.warn('⚠️ Location initialization error:', err);
      }
    };

    initLocation();
  }, []);

  /**
   * Initiate SOS with 5-second countdown
   */
  const initiateSOSCountdown = useCallback(async () => {
    if (isSOSActive) {
      console.warn('⚠️ SOS already active');
      return;
    }

    if (!userId) {
      setError('User ID required for SOS');
      return;
    }

    try {
      setError(null);
      setIsSOSActive(true);
      setCanCancel(true);

      console.log('🚨 SOS INITIATED - Getting location...');

      // Get current location in parallel
      let location = null;
      try {
        location = await LocationService.getCurrentLocation({
          timeout: 10000,
          accuracy: 'Highest',
        });
        console.log('✅ Location obtained:', location);
      } catch (locError) {
        console.warn('⚠️ Location unavailable:', locError.message);
        // Continue with SOS even if location fails
        location = await LocationService.getLastKnownLocation();
      }

      // Initiate SOS with countdown
      const sosData = await SOSService.initiateSOS({
        location,
        userId,
        countdownDuration,
        onCountdownTick: (remainingTime) => {
          setCountdownTime(remainingTime);

          // Disable cancel after 1 second remaining
          if (remainingTime <= 1000) {
            setCanCancel(false);
          }
        },
        onSOSConfirmed: (data) => {
          sosDataRef.current = data;
          setIsSOSActive(false);
          setCountdownTime(0);

          console.log('✅ SOS CONFIRMED - Alert sent');

          if (onSOSConfirmed) {
            onSOSConfirmed(data);
          }
        },
      });

      sosDataRef.current = sosData;
    } catch (err) {
      console.error('❌ Error initiating SOS:', err);
      setError(err.message);
      setIsSOSActive(false);
    }
  }, [userId, countdownDuration, onSOSConfirmed, isSOSActive]);

  /**
   * Cancel SOS with PIN verification
   * @param {string} pin - PIN entered by user
   */
  const cancelSOSWithPin = useCallback(
    async (pin) => {
      if (!canCancel) {
        setError('Too late to cancel (1 second remaining)');
        return false;
      }

      try {
        // Verify PIN
        const isPinValid = await StorageService.verifyPIN(pin);

        if (!isPinValid) {
          setError('Invalid PIN');
          return false;
        }

        // Cancel SOS
        await SOSService.cancelSOS('pin_verified');
        setIsSOSActive(false);
        setCountdownTime(0);

        console.log('✅ SOS cancelled with PIN');

        if (onSOSCancelled) {
          onSOSCancelled('pin_verified');
        }

        return true;
      } catch (err) {
        console.error('❌ Error cancelling SOS:', err);
        setError(err.message);
        return false;
      }
    },
    [canCancel, onSOSCancelled]
  );

  /**
   * Cancel SOS with long-press
   */
  const cancelSOSWithLongPress = useCallback(async () => {
    if (!canCancel) {
      setError('Too late to cancel (1 second remaining)');
      return false;
    }

    try {
      await SOSService.cancelSOS('long_press');
      setIsSOSActive(false);
      setCountdownTime(0);

      console.log('✅ SOS cancelled with long-press');

      if (onSOSCancelled) {
        onSOSCancelled('long_press');
      }

      return true;
    } catch (err) {
      console.error('❌ Error cancelling SOS:', err);
      setError(err.message);
      return false;
    }
  }, [canCancel, onSOSCancelled]);

  /**
   * Get remaining countdown in seconds
   */
  const getCountdownSeconds = useCallback(() => {
    return Math.ceil(countdownTime / 1000);
  }, [countdownTime]);

  /**
   * Process any queued SOS (for network retry)
   */
  const processQueue = useCallback(async () => {
    try {
      await SOSService.processSOSQueue();
      console.log('✅ SOS queue processed');
    } catch (err) {
      console.error('❌ Error processing SOS queue:', err);
      setError(err.message);
    }
  }, []);

  return {
    isSOSActive,
    countdownTime,
    countdownSeconds: getCountdownSeconds(),
    canCancel,
    error,
    initiateSOSCountdown,
    cancelSOSWithPin,
    cancelSOSWithLongPress,
    processQueue,
  };
};
