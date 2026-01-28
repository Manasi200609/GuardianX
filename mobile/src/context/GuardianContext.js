// src/context/GuardianContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { toggleGuardianMode } from '../services/api';
import emergencyFlowService from '../services/emergencyFlow';
import gestureDetectionService from '../services/gestureDetection';

export const GuardianContext = createContext();

export const GuardianProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [user, setUser] = useState(null);
  const [sosScreenNavigation, setSosScreenNavigation] = useState(null);

  // Multiple gesture preferences, one flag per gesture
  const [gesturePreferences, setGesturePreferences] = useState({
    waving: false,
    fist: true, // Default: fist gesture enabled
    open_palm: false,
    phone_shake: false,
  });

  // Initialize gesture detection when Guardian Mode is active
  useEffect(() => {
    if (isActive && user?._id) {
      // Initialize gesture detection with emergency callback
      gestureDetectionService.initialize((emergencyData) => {
        console.log('🚨 Emergency detected via gesture:', emergencyData);
        // Use emergency flow service to handle the complete flow
        handleEmergencyDetected('gesture', emergencyData);
      });

      // Start gesture detection
      gestureDetectionService.startDetection().catch((error) => {
        console.error('Failed to start gesture detection:', error);
      });
    } else {
      // Stop gesture detection when Guardian Mode is inactive
      gestureDetectionService.stopDetection();
    }

    return () => {
      gestureDetectionService.stopDetection();
    };
  }, [isActive, user?._id]);

  const toggleGuardian = async () => {
    if (!user?._id) {
      Alert.alert('Not logged in', 'Please login first.');
      return;
    }

    try {
      const newState = !isActive;
      setIsActive(newState);

      await toggleGuardianMode(user._id, {
        active: newState,
        timestamp: new Date(),
      });

      console.log(`🛡️ Guardian Mode ${newState ? 'ACTIVATED' : 'DEACTIVATED'}`);
    } catch (error) {
      console.log(
        'Guardian toggle error:',
        error.response?.data || error.message
      );
      // Revert state on error
      setIsActive(!isActive);
    }
  };

  // Turn a specific gesture on/off
  const toggleGesturePreference = (gestureId) => {
    setGesturePreferences((prev) => ({
      ...prev,
      [gestureId]: !prev[gestureId],
    }));
  };

  /**
   * Handle emergency detection (called by gesture detection or manual trigger)
   * @param {string} triggerType - 'gesture', 'manual', 'motion', etc.
   * @param {Object} additionalData - Additional emergency data
   */
  const handleEmergencyDetected = async (triggerType, additionalData = {}) => {
    if (!user?._id) {
      Alert.alert('Not logged in', 'Please login first.');
      return;
    }

    try {
      // Use emergency flow service for complete emergency handling
      const result = await emergencyFlowService.triggerEmergency(
        user._id,
        triggerType,
        additionalData
      );

      if (result.success) {
        console.log('✅ Emergency processed:', result);

        // Navigate to SOS screen with auto-sent flag
        if (sosScreenNavigation) {
          sosScreenNavigation.navigate('SOS', {
            lat: result.location?.latitude,
            lng: result.location?.longitude,
            autoSent: true,
          });
        }

        return result;
      } else {
        throw new Error(result.message || 'Failed to process emergency');
      }
    } catch (error) {
      console.error('❌ Emergency handling error:', error);
      Alert.alert(
        'Emergency Alert',
        'Emergency alert has been sent. Some services may be unavailable.'
      );
      throw error;
    }
  };

  /**
   * Manual SOS trigger (for button presses)
   */
  const sendSOS = async (location = null) => {
    return handleEmergencyDetected('manual', { location });
  };

  return (
    <GuardianContext.Provider
      value={{
        isActive,
        toggleGuardian,
        sendSOS,
        handleEmergencyDetected,
        user,
        setUser,
        sosScreenNavigation,
        setSosScreenNavigation,
        gesturePreferences,
        toggleGesturePreference,
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
};