/**
 * useGestureDetection.js
 * 
 * React hook for managing gesture detection lifecycle and state
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import GestureDetectionService from '../services/GestureDetectionService';

/**
 * Hook to manage gesture detection
 * @param {Function} onGestureDetected - Callback when triple-tap is detected
 * @param {Object} options - Configuration options
 * @returns {Object} - Gesture detection state and controls
 */
export const useGestureDetection = (onGestureDetected, options = {}) => {
  const [isActive, setIsActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [error, setError] = useState(null);
  const gestureCallbackRef = useRef(null);

  // Initialize gesture detection
  useEffect(() => {
    try {
      // Wrap callback to also update UI state
      const wrappedCallback = (gestureData) => {
        console.log('🎯 Gesture detected in hook:', gestureData);
        
        // Reset tap count
        setTapCount(0);

        // Call user's callback
        if (onGestureDetected) {
          onGestureDetected(gestureData);
        }
      };

      gestureCallbackRef.current = wrappedCallback;
      
      // Initialize service
      GestureDetectionService.initialize(wrappedCallback, options);

      return () => {
        // Cleanup on unmount
        GestureDetectionService.destroy();
      };
    } catch (error) {
      console.error('❌ Failed to initialize gesture detection:', error);
      setError(error.message);
    }
  }, [onGestureDetected, options]);

  // Control active state
  const startDetection = useCallback(async () => {
    try {
      await GestureDetectionService.startDetection();
      setIsActive(true);
      setError(null);
      console.log('✅ Gesture detection started');
    } catch (error) {
      console.error('❌ Failed to start detection:', error);
      setError(error.message);
    }
  }, []);

  const stopDetection = useCallback(async () => {
    try {
      await GestureDetectionService.stopDetection();
      setIsActive(false);
      setTapCount(0);
      setError(null);
      console.log('🛑 Gesture detection stopped');
    } catch (error) {
      console.error('❌ Failed to stop detection:', error);
      setError(error.message);
    }
  }, []);

  const resetDetection = useCallback(() => {
    GestureDetectionService.reset();
    setTapCount(0);
    console.log('🔄 Gesture detection reset');
  }, []);

  const simulateTap = useCallback(() => {
    GestureDetectionService.simulateTap();
    setTapCount((prev) => Math.min(prev + 1, 3));
  }, []);

  const getStatus = useCallback(() => {
    return GestureDetectionService.getStatus();
  }, []);

  return {
    isActive,
    tapCount,
    error,
    startDetection,
    stopDetection,
    resetDetection,
    simulateTap,
    getStatus,
  };
};
