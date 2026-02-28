/**
 * useGuardianMode.js
 * 
 * React hook for managing Guardian Mode lifecycle and state
 */

import { useEffect, useState, useCallback } from 'react';
import StorageService from '../services/StorageService';

/**
 * Hook to manage Guardian Mode state
 * @param {string} userId - Current user ID
 * @returns {Object} - Guardian Mode state and controls
 */
export const useGuardianMode = (userId) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Guardian Mode state on mount
  useEffect(() => {
    const initializeGuardianMode = async () => {
      try {
        setIsLoading(true);

        // Check both Guardian Mode and onboarding status
        const [guardianMode, onboarded] = await Promise.all([
          StorageService.getGuardianMode(),
          StorageService.isOnboardingComplete(),
        ]);

        setIsEnabled(guardianMode.enabled === true);
        setOnboardingComplete(onboarded);
        setError(null);

        console.log('✅ Guardian Mode state loaded:', {
          enabled: guardianMode.enabled,
          onboarded,
        });
      } catch (err) {
        console.error('❌ Failed to initialize Guardian Mode:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGuardianMode();
  }, []);

  // Toggle Guardian Mode
  const toggleGuardianMode = useCallback(async (enable) => {
    try {
      // Check prerequisites
      if (enable && !onboardingComplete) {
        throw new Error('Onboarding must be completed first');
      }

      if (enable && !userId) {
        throw new Error('User must be logged in');
      }

      // Update storage
      await StorageService.setGuardianMode(enable, userId || null);
      setIsEnabled(enable);
      setError(null);

      console.log(`✅ Guardian Mode ${enable ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('❌ Failed to toggle Guardian Mode:', err);
      setError(err.message);
      throw err;
    }
  }, [userId, onboardingComplete]);

  // Mark onboarding as complete
  const completeOnboarding = useCallback(async () => {
    try {
      await StorageService.setOnboardingComplete(true);
      setOnboardingComplete(true);
      setError(null);

      console.log('✅ Onboarding completed');
    } catch (err) {
      console.error('❌ Failed to complete onboarding:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Check if Guardian Mode can be enabled
  const canEnableGuardianMode = useCallback(() => {
    if (!onboardingComplete) {
      return { can: false, reason: 'Onboarding not completed' };
    }

    if (!userId) {
      return { can: false, reason: 'User not logged in' };
    }

    return { can: true, reason: null };
  }, [onboardingComplete, userId]);

  return {
    isEnabled,
    onboardingComplete,
    isLoading,
    error,
    toggleGuardianMode,
    completeOnboarding,
    canEnableGuardianMode,
  };
};
