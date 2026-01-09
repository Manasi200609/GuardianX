// src/context/GuardianContext.js
import React, { createContext, useState } from 'react';
import { Alert } from 'react-native';
import {
  toggleGuardianMode as toggleGuardianModeApi,
  triggerSOS as triggerSOSApi,
} from '../services/api';

export const GuardianContext = createContext();

export const GuardianProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [user, setUser] = useState(null); // store logged-in user

  /* ========== TOGGLE GUARDIAN MODE ========== */
  const toggleGuardian = async () => {
    if (!user?._id) {
      Alert.alert('Not logged in', 'Please login first.');
      return;
    }

    try {
      const newState = !isActive;
      setIsActive(newState);

      await toggleGuardianModeApi(user._id, {
        active: newState,
        timestamp: new Date(),
      });
    } catch (error) {
      console.log('Guardian toggle error:', error.response?.data || error.message);
    }
  };

  /* ========== SOS TRIGGER ========== */
  const sendSOS = async (location = null) => {
    if (!user?._id) {
      Alert.alert('Not logged in', 'Please login first.');
      return;
    }

    try {
      await triggerSOSApi(user._id, {
        triggeredAt: new Date(),
        location,
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
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
};
