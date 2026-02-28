/**
 * SOSService.js
 * 
 * Handles SOS trigger, safety confirmation flow, and emergency contact notification
 * 
 * Features:
 * - 5-second silent countdown before SOS
 * - Cancel with PIN or long-press
 * - Emergency contact notification (SMS/Firebase)
 * - Location attachment to SOS
 * - Retry logic for failed transmissions
 * - Cooldown period to prevent accidental double-triggers
 * - Offline support with retry queue
 */

import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

class SOSService {
  constructor() {
    this.isSOSActive = false;
    this.sosStartTime = null;
    this.countdownTimeout = null;
    this.emergencyContacts = [];
    this.sosQueue = []; // Queue for failed SOS sends
    this.lastSOSTime = 0;
    this.sosRetryLimit = 3;
    this.sosRetryInterval = 5000; // 5 seconds between retries
    this.storageKey = '@guardian_sos_queue';
    this.contactsKey = '@guardian_emergency_contacts';
  }

  /**
   * Start the SOS confirmation flow
   * @param {Object} options - Configuration
   * @returns {Promise<Object>} - SOS data
   */
  async initiateSOS(options = {}) {
    const {
      location = null,
      userId = null,
      countdownDuration = 5000, // 5 seconds
      onCountdownTick = null,
      onSOSConfirmed = null,
      onSOSCancelled = null,
    } = options;

    // Check cooldown
    if (this.isInCooldown()) {
      console.log('⏸️  SOS in cooldown, ignoring');
      return { error: 'SOS in cooldown period' };
    }

    if (this.isSOSActive) {
      console.warn('⚠️ SOS already active');
      return { error: 'SOS already in progress' };
    }

    console.log('🚨 SOS INITIATED - Starting 5-second countdown');
    this.isSOSActive = true;
    this.sosStartTime = Date.now();

    const sosData = {
      timestamp: Date.now(),
      userId,
      location,
      status: 'pending_confirmation',
      countdownDuration,
    };

    // Start countdown
    let remainingTime = countdownDuration;
    const startTime = Date.now();

    // Call initial tick
    if (onCountdownTick) {
      onCountdownTick(remainingTime);
    }

    return new Promise((resolve) => {
      // Countdown interval
      const countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        remainingTime = Math.max(0, countdownDuration - elapsed);

        // Notify tick updates
        if (onCountdownTick) {
          onCountdownTick(remainingTime);
        }

        // Countdown complete
        if (remainingTime <= 0) {
          clearInterval(countdownInterval);
          if (this.countdownTimeout) {
            clearTimeout(this.countdownTimeout);
          }

          this.confirmSOS(sosData, onSOSConfirmed);
          resolve({ ...sosData, status: 'confirmed' });
        }
      }, 100); // Update UI every 100ms for smooth countdown

      this.countdownTimeout = countdownInterval;

      // Store the interval ID for potential cancellation
      sosData._countdownInterval = countdownInterval;
      sosData._resolve = resolve;
    });
  }

  /**
   * Confirm and trigger the actual SOS alert
   * @param {Object} sosData - SOS information
   * @param {Function} onConfirmed - Callback after SOS is sent
   */
  async confirmSOS(sosData, onConfirmed) {
    try {
      console.log('✅ SOS CONFIRMED - Sending alert');

      // Record last SOS time for cooldown
      this.lastSOSTime = Date.now();

      // Send SOS to emergency contacts
      await this.sendSOSAlert(sosData);

      // Update status
      sosData.status = 'confirmed';

      // Clear SOS active flag after brief delay
      setTimeout(() => {
        this.isSOSActive = false;
      }, 1000);

      if (onConfirmed) {
        onConfirmed(sosData);
      }

      console.log('🎯 SOS successfully triggered');
    } catch (error) {
      console.error('❌ Error confirming SOS:', error);
      this.isSOSActive = false;
      throw error;
    }
  }

  /**
   * Cancel the SOS countdown
   * @param {string} reason - Reason for cancellation
   * @param {Function} onCancelled - Callback after cancellation
   */
  async cancelSOS(reason = 'user_cancelled', onCancelled = null) {
    if (!this.isSOSActive) {
      console.warn('⚠️ No active SOS to cancel');
      return;
    }

    try {
      // Clear countdown
      if (this.countdownTimeout) {
        clearTimeout(this.countdownTimeout);
        this.countdownTimeout = null;
      }

      this.isSOSActive = false;
      console.log('❌ SOS CANCELLED:', reason);

      if (onCancelled) {
        onCancelled(reason);
      }
    } catch (error) {
      console.error('❌ Error cancelling SOS:', error);
    }
  }

  /**
   * Cancel SOS with PIN verification
   * @param {string} pin - PIN entered by user
   * @param {string} correctPin - Correct PIN
   * @returns {Promise<boolean>}
   */
  async cancelSOSWithPin(pin, correctPin) {
    if (pin === correctPin) {
      await this.cancelSOS('pin_verified');
      return true;
    }

    console.warn('❌ Incorrect PIN');
    return false;
  }

  /**
   * Send SOS alert to emergency contacts
   * @param {Object} sosData - SOS information including location
   */
  async sendSOSAlert(sosData) {
    try {
      // Get emergency contacts
      const contacts = await this.getEmergencyContacts();

      if (!contacts || contacts.length === 0) {
        console.warn('⚠️ No emergency contacts configured');
        return;
      }

      // Prepare SOS message
      const message = this.formatSOSMessage(sosData);

      console.log(`📱 Sending SOS to ${contacts.length} emergency contact(s)`);

      // Try Firebase/API first, fallback to SMS
      const apiSent = await this.sendViaAPI(sosData, contacts);

      if (apiSent) {
        console.log('✅ SOS sent via API');
      } else {
        // Fallback to SMS
        await this.sendViaSMS(message, contacts);
        console.log('✅ SOS sent via SMS');
      }

      // Save to queue in case of network issues
      await this.addToSOSQueue(sosData);
    } catch (error) {
      console.error('❌ Error sending SOS alert:', error);
      // Queue for retry
      await this.addToSOSQueue(sosData);
    }
  }

  /**
   * Send SOS via API/Firebase
   * @param {Object} sosData - SOS data
   * @param {Array} contacts - Emergency contacts
   * @returns {Promise<boolean>}
   */
  async sendViaAPI(sosData, contacts) {
    try {
      const payload = {
        type: 'sos_alert',
        userId: sosData.userId,
        timestamp: sosData.timestamp,
        location: sosData.location,
        contacts: contacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          email: c.email,
        })),
      };

      // Send to backend
      // Compute backend base (API_BASE_URL may point to /api/users)
      const backendBase = API_BASE_URL.replace('/api/users', '') || API_BASE_URL;
      const response = await axios.post(`${backendBase}/emergencies`, payload, {
        timeout: 10000,
      });

      console.log('✅ SOS API response:', response.status);
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.warn('⚠️ API send failed:', error.message);
      return false;
    }
  }

  /**
   * Send SOS via SMS (Android fallback)
   * @param {string} message - SOS message
   * @param {Array} contacts - Emergency contacts
   */
  async sendViaSMS(message, contacts) {
    try {
      const isAvailable = await SMS.isAvailableAsync();

      if (!isAvailable) {
        console.warn('⚠️ SMS not available on this device');
        return;
      }

      const phoneNumbers = contacts
        .map((c) => c.phone)
        .filter((phone) => phone);

      if (phoneNumbers.length === 0) {
        console.warn('⚠️ No phone numbers available');
        return;
      }

      // Send SMS to each contact
      for (const phone of phoneNumbers) {
        try {
          // sendSMSAsync expects an array of recipients; send to each individually
          await SMS.sendSMSAsync([phone], message);
          console.log(`✅ SMS sent (attempt) to ${phone}`);
        } catch (error) {
          console.warn(`⚠️ Failed to send SMS to ${phone}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ SMS error:', error);
    }
  }

  /**
   * Format SOS message with location details
   * @param {Object} sosData - SOS data
   * @returns {string}
   */
  formatSOSMessage(sosData) {
    const location = sosData.location;
    const locationText = location
      ? `\nLocation: https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : '\nLocation: Unavailable';

    const message =
      `🆘 EMERGENCY - I NEED HELP! 🆘\n\n` +
      `Sent via GuardianX Safety App\n` +
      `Time: ${new Date(sosData.timestamp).toLocaleString()}` +
      locationText +
      `\n\nIf you received this, please call me or contact emergency services.`;

    return message;
  }

  /**
   * Add SOS to offline queue for retry
   * @param {Object} sosData - SOS data
   */
  async addToSOSQueue(sosData) {
    try {
      const existingQueue = await AsyncStorage.getItem(this.storageKey);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];

      queue.push({
        ...sosData,
        retryCount: 0,
        queuedAt: Date.now(),
      });

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(queue));
      console.log('📦 SOS added to retry queue');
    } catch (error) {
      console.error('❌ Failed to queue SOS:', error);
    }
  }

  /**
   * Process SOS queue (called when network is available)
   */
  async processSOSQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.storageKey);
      if (!queueData) return;

      const queue = JSON.parse(queueData);

      for (const sosData of queue) {
        if (sosData.retryCount >= this.sosRetryLimit) {
          console.warn('⚠️ SOS retry limit exceeded, removing from queue');
          continue;
        }

        try {
          await this.sendSOSAlert(sosData);
          console.log('✅ Queued SOS sent successfully');
        } catch (error) {
          sosData.retryCount += 1;
          console.warn(`⚠️ Retry ${sosData.retryCount}/${this.sosRetryLimit} failed`);
        }
      }

      // Clear successful sends from queue
      const remainingQueue = queue.filter((s) => s.retryCount < this.sosRetryLimit);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(remainingQueue));
    } catch (error) {
      console.error('❌ Error processing SOS queue:', error);
    }
  }

  /**
   * Get emergency contacts
   * @returns {Promise<Array>}
   */
  async getEmergencyContacts() {
    try {
      const stored = await AsyncStorage.getItem(this.contactsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get emergency contacts:', error);
      return [];
    }
  }

  /**
   * Add emergency contact
   * @param {Object} contact - Contact object {name, phone, email}
   */
  async addEmergencyContact(contact) {
    try {
      const contacts = await this.getEmergencyContacts();
      contacts.push(contact);
      await AsyncStorage.setItem(this.contactsKey, JSON.stringify(contacts));
      console.log('✅ Emergency contact added:', contact.name);
    } catch (error) {
      console.error('❌ Failed to add emergency contact:', error);
    }
  }

  /**
   * Remove emergency contact
   * @param {string} phone - Phone number to remove
   */
  async removeEmergencyContact(phone) {
    try {
      const contacts = await this.getEmergencyContacts();
      const filtered = contacts.filter((c) => c.phone !== phone);
      await AsyncStorage.setItem(this.contactsKey, JSON.stringify(filtered));
      console.log('✅ Emergency contact removed');
    } catch (error) {
      console.error('❌ Failed to remove emergency contact:', error);
    }
  }

  /**
   * Check if device is in SOS cooldown
   * @returns {boolean}
   */
  isInCooldown() {
    const cooldownPeriod = 30000; // 30 seconds
    return Date.now() - this.lastSOSTime < cooldownPeriod;
  }

  /**
   * Get SOS status
   */
  getStatus() {
    return {
      isSOSActive: this.isSOSActive,
      lastSOSTime: this.lastSOSTime,
      inCooldown: this.isInCooldown(),
      timeUntilCooldown: Math.max(
        0,
        30000 - (Date.now() - this.lastSOSTime)
      ),
    };
  }

  /**
   * Cleanup service
   */
  async destroy() {
    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout);
    }
    this.isSOSActive = false;
    console.log('🗑️ SOSService destroyed');
  }
}

// Export singleton instance
export default new SOSService();
