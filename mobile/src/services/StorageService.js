/**
 * StorageService.js
 * 
 * Handles secure storage of Guardian Mode state and sensitive configuration
 * 
 * Features:
 * - Secure storage of Guardian Mode state
 * - Onboarding status tracking
 * - User preferences
 * - Token management (if needed)
 * - Support for expo-secure-store on native platforms
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class StorageService {
  constructor() {
    this.guardianModeKey = '@guardian_mode_enabled';
    this.onboardingCompleteKey = '@guardian_onboarding_complete';
    this.userIdKey = '@guardian_user_id';
    this.pinKey = '@guardian_pin'; // Encrypted PIN
    this.contactsKey = '@guardian_emergency_contacts';
  }

  /**
   * Set Guardian Mode state
   * @param {boolean} enabled - Whether Guardian Mode is enabled
   * @param {string} userId - User ID
   */
  async setGuardianMode(enabled, userId) {
    try {
      const data = {
        enabled,
        userId,
        lastUpdated: Date.now(),
      };

      await AsyncStorage.setItem(
        this.guardianModeKey,
        JSON.stringify(data)
      );

      console.log(`✅ Guardian Mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Failed to set Guardian Mode:', error);
      throw error;
    }
  }

  /**
   * Get Guardian Mode state
   * @returns {Promise<Object>}
   */
  async getGuardianMode() {
    try {
      const data = await AsyncStorage.getItem(this.guardianModeKey);
      if (!data) {
        return { enabled: false, userId: null };
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to get Guardian Mode:', error);
      return { enabled: false, userId: null };
    }
  }

  /**
   * Check if Guardian Mode is enabled
   * @returns {Promise<boolean>}
   */
  async isGuardianModeEnabled() {
    try {
      const mode = await this.getGuardianMode();
      return mode.enabled === true;
    } catch (error) {
      console.error('❌ Error checking Guardian Mode:', error);
      return false;
    }
  }

  /**
   * Set onboarding completion status
   * @param {boolean} completed - Whether onboarding is complete
   */
  async setOnboardingComplete(completed) {
    try {
      await AsyncStorage.setItem(
        this.onboardingCompleteKey,
        JSON.stringify({
          completed,
          completedAt: completed ? Date.now() : null,
        })
      );

      console.log(
        `✅ Onboarding status set to ${completed ? 'complete' : 'incomplete'}`
      );
    } catch (error) {
      console.error('❌ Failed to set onboarding status:', error);
      throw error;
    }
  }

  /**
   * Check if onboarding is complete
   * @returns {Promise<boolean>}
   */
  async isOnboardingComplete() {
    try {
      const data = await AsyncStorage.getItem(this.onboardingCompleteKey);
      if (!data) {
        return false;
      }

      const parsed = JSON.parse(data);
      return parsed.completed === true;
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Set user ID (securely on native, AsyncStorage on web)
   * @param {string} userId - User ID
   */
  async setUserId(userId) {
    try {
      if (Platform.OS !== 'web') {
        // Use secure storage on native platforms
        try {
          await SecureStore.setItemAsync(this.userIdKey, userId);
          console.log('✅ User ID stored securely');
          return;
        } catch (error) {
          console.warn('⚠️ Secure store unavailable, using AsyncStorage:', error);
        }
      }

      // Fallback to AsyncStorage
      await AsyncStorage.setItem(this.userIdKey, userId);
      console.log('✅ User ID stored');
    } catch (error) {
      console.error('❌ Failed to store user ID:', error);
      throw error;
    }
  }

  /**
   * Get user ID
   * @returns {Promise<string|null>}
   */
  async getUserId() {
    try {
      if (Platform.OS !== 'web') {
        try {
          const userId = await SecureStore.getItemAsync(this.userIdKey);
          if (userId) {
            console.log('✅ User ID retrieved from secure store');
            return userId;
          }
        } catch (error) {
          console.warn('⚠️ Secure store read failed:', error);
        }
      }

      // Fallback to AsyncStorage
      const userId = await AsyncStorage.getItem(this.userIdKey);
      if (userId) {
        console.log('✅ User ID retrieved');
      }
      return userId;
    } catch (error) {
      console.error('❌ Failed to get user ID:', error);
      return null;
    }
  }

  /**
   * Store SOS PIN (encrypted)
   * @param {string} pin - 4-6 digit PIN
   */
  async setPIN(pin) {
    try {
      // Basic validation
      if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
        throw new Error('PIN must be 4-6 digits');
      }

      if (Platform.OS !== 'web') {
        try {
          await SecureStore.setItemAsync(this.pinKey, pin);
          console.log('✅ PIN stored securely');
          return;
        } catch (error) {
          console.warn('⚠️ Secure store unavailable, using AsyncStorage:', error);
        }
      }

      // Fallback: Hash PIN before storing (simple hash)
      const hash = this.simpleHash(pin);
      await AsyncStorage.setItem(this.pinKey, hash);
      console.log('✅ PIN stored');
    } catch (error) {
      console.error('❌ Failed to store PIN:', error);
      throw error;
    }
  }

  /**
   * Verify SOS PIN
   * @param {string} pin - PIN to verify
   * @returns {Promise<boolean>}
   */
  async verifyPIN(pin) {
    try {
      if (Platform.OS !== 'web') {
        try {
          const stored = await SecureStore.getItemAsync(this.pinKey);
          if (stored === pin) {
            console.log('✅ PIN verified');
            return true;
          }
        } catch (error) {
          console.warn('⚠️ Secure store read failed:', error);
        }
      }

      // Fallback: Compare hashes
      const stored = await AsyncStorage.getItem(this.pinKey);
      const hash = this.simpleHash(pin);

      if (stored === hash) {
        console.log('✅ PIN verified');
        return true;
      }

      console.warn('❌ PIN verification failed');
      return false;
    } catch (error) {
      console.error('❌ Error verifying PIN:', error);
      return false;
    }
  }

  /**
   * Simple hash function for PIN (not for production security)
   * For production, use proper encryption library
   * @param {string} str - String to hash
   * @returns {string}
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear all Guardian data
   */
  async clearAll() {
    try {
      const keys = [
        this.guardianModeKey,
        this.onboardingCompleteKey,
        this.userIdKey,
        this.pinKey,
        this.contactsKey,
      ];

      await AsyncStorage.multiRemove(keys);

      if (Platform.OS !== 'web') {
        try {
          await SecureStore.deleteItemAsync(this.userIdKey);
          await SecureStore.deleteItemAsync(this.pinKey);
        } catch (error) {
          console.warn('⚠️ Secure store clear failed:', error);
        }
      }

      console.log('✅ All Guardian data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  }

  /**
   * Get all stored Guardian data (for debugging)
   */
  async getAllData() {
    try {
      const data = {
        guardianMode: await this.getGuardianMode(),
        onboardingComplete: await this.isOnboardingComplete(),
        userId: await this.getUserId(),
      };

      return data;
    } catch (error) {
      console.error('❌ Failed to get all data:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new StorageService();
