// src/context/GuardianContext.js
import React, { createContext, useState } from 'react';
import { Alert } from 'react-native';
import { toggleGuardianMode, triggerSOS } from '../services/api';

export const GuardianContext = createContext();

export const GuardianProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [user, setUser] = useState(null);

  // Multiple gesture preferences, one flag per gesture
  const [gesturePreferences, setGesturePreferences] = useState({
    waving: false,
    fist: false,
    open_palm: false,
    phone_shake: false, // optional extra gesture
  });

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
    } catch (error) {
      console.log(
        'Guardian toggle error:',
        error.response?.data || error.message
      );
    }
  };

  // Turn a specific gesture on/off
  const toggleGesturePreference = (gestureId) => {
    setGesturePreferences((prev) => ({
      ...prev,
      [gestureId]: !prev[gestureId],
    }));
  };

  const sendSOS = async (location = null) => {
    if (!user?._id) {
      Alert.alert('Not logged in', 'Please login first.');
      return;
    }

    try {
      await triggerSOS(user._id, {
        triggeredAt: new Date(),
        location,
        // you can store which gestures are currently enabled
        gesturePreferences,
      });

      Alert.alert(
        'Emergency Alert Sent',
        'Your emergency contacts have been notified.'
      );
    } catch (error) {
      console.log('SOS Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send SOS alert');
    }
  };

  return (
    <GuardianContext.Provider
      value={{
        isActive,
        toggleGuardian,
        sendSOS,
        user,
        setUser,
        gesturePreferences,        // read which gestures are enabled
        toggleGesturePreference,   // toggle a specific gesture
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
};
