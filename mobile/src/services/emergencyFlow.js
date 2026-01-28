// src/services/emergencyFlow.js
// Complete Emergency Flow Service
// Handles: GPS location → SMS to guardians → Backend logging → UI feedback

import * as Location from 'expo-location';
import axios from 'axios';
import { API_BASE_URL } from './api';

const EMERGENCY_API_BASE = API_BASE_URL.replace('/api/users', '/api/emergencies');

/**
 * Emergency Flow Service
 * 
 * Orchestrates the complete emergency response:
 * 1. Get current GPS location (with fallback if unavailable)
 * 2. Send SOS SMS to emergency contacts (via backend)
 * 3. Log emergency event to backend
 * 4. Return status for UI feedback
 */
class EmergencyFlowService {
  constructor() {
    this.isProcessing = false;
  }

  /**
   * Trigger complete emergency flow
   * @param {string} userId - User ID
   * @param {string} triggerType - 'gesture', 'manual', 'motion', 'route_deviation'
   * @param {Object} additionalData - Additional data (gesture info, etc.)
   * @returns {Promise<Object>} - Emergency response data
   */
  async triggerEmergency(userId, triggerType = 'manual', additionalData = {}) {
    if (this.isProcessing) {
      console.log('⚠️ Emergency already processing, ignoring duplicate trigger');
      throw new Error('Emergency already processing');
    }

    this.isProcessing = true;

    try {
      console.log('🚨 EMERGENCY FLOW STARTED');
      console.log(`User: ${userId} | Type: ${triggerType}`);

      // Step 1: Get GPS location (with fallback for permission denied)
      let location = null;
      try {
        location = await this.getCurrentLocation();
        console.log('📍 Location obtained:', location);
      } catch (locationError) {
        console.warn('⚠️ Could not get location, using fallback:', locationError.message);
        location = this.getDefaultLocation();
        console.log('📍 Using fallback location:', location);
      }

      // Validate location before sending
      if (!location || location.latitude === null || location.longitude === null || location.latitude === undefined || location.longitude === undefined) {
        console.warn('⚠️ Location invalid, using default location');
        location = this.getDefaultLocation();
      }

      // Step 2: Log emergency to backend (this also sends SMS)
      const emergencyResponse = await this.logEmergencyToBackend({
        userId,
        triggerType,
        location,
        ...additionalData,
      });

      console.log('✅ Emergency logged:', emergencyResponse);

      this.isProcessing = false;

      return {
        success: true,
        emergency: emergencyResponse.emergency,
        location,
        smsSent: emergencyResponse.smsSent,
        contactsNotified: emergencyResponse.contactsNotified,
        message: 'Emergency detected. Help is on the way.',
      };
    } catch (error) {
      console.error('❌ Emergency handling error:', error);
      this.isProcessing = false;

      // Even if backend fails, try to send SMS directly via SOS endpoint
      try {
        let location = null;
        try {
          location = await this.getCurrentLocation();
        } catch {
          location = this.getDefaultLocation();
        }
        console.log('📞 Attempting fallback SOS with location:', location);
        await this.sendSOSDirect(userId, location);
        console.log('✅ Fallback SOS sent successfully');
      } catch (fallbackError) {
        console.error('❌ Fallback SOS also failed:', fallbackError);
      }

      throw error; // Re-throw so GuardianContext can handle
    }
  }

  /**
   * Get default location when permission is denied
   * Returns a valid location object with real coordinates as fallback
   * @returns {Object} - Default location data
   */
  getDefaultLocation() {
    return {
      latitude: 18.4595397, // Pune center coordinates as fallback
      longitude: 73.8118258,
      accuracy: 1000,
      altitude: 515,
      heading: 0,
      speed: 0,
      address: 'Location permission denied - fallback location',
      timestamp: new Date(),
      isDefault: true,
    };
  }

  /**
   * Get current GPS location with high accuracy
   * @returns {Promise<Object>} - Location data
   */
  async getCurrentLocation() {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 5000, // Accept location up to 5 seconds old
      });

      // Reverse geocode to get address (optional, non-blocking)
      let address = null;
      try {
        const [reverseGeocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverseGeocode) {
          address = [
            reverseGeocode.street,
            reverseGeocode.city,
            reverseGeocode.region,
            reverseGeocode.country,
          ]
            .filter(Boolean)
            .join(', ');
        }
      } catch (geocodeError) {
        console.log('⚠️ Reverse geocoding failed (non-critical):', geocodeError);
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        address: address || 'Location obtained',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Location error:', error.message);
      throw error;
    }
  }

  /**
   * Log emergency to backend (includes SMS sending)
   * @param {Object} emergencyData - Emergency data
   * @returns {Promise<Object>} - Backend response
   */
  async logEmergencyToBackend(emergencyData) {
    try {
      // Safety check - ensure location exists and has valid coordinates
      let location = emergencyData.location || this.getDefaultLocation();
      
      // Double-check that latitude and longitude are numbers
      if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        console.warn('⚠️ Location coordinates invalid, using default');
        location = this.getDefaultLocation();
      }

      console.log('📤 Sending to backend:', {
        userId: emergencyData.userId,
        triggerType: emergencyData.triggerType,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          address: location.address,
        },
      });

      const response = await axios.post(
        `${EMERGENCY_API_BASE}`,
        {
          userId: emergencyData.userId,
          triggerType: emergencyData.triggerType,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            address: location.address,
          },
          gestureData: emergencyData.gestureData || null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('✅ Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Backend logging error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fallback: Send SOS directly via SOS endpoint
   * @param {string} userId - User ID
   * @param {Object} location - Location data
   */
  async sendSOSDirect(userId, location) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${userId}/sos`,
        {
          lat: location.latitude,
          lng: location.longitude,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Fallback SOS sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Direct SOS error:', error);
      throw error;
    }
  }

  /**
   * Get emergency logs for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Emergency logs
   */
  async getEmergencyLogs(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.status) params.append('status', options.status);

      const response = await axios.get(
        `${EMERGENCY_API_BASE}/user/${userId}?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.emergencies || [];
    } catch (error) {
      console.error('❌ Get emergency logs error:', error);
      return [];
    }
  }
}

export default new EmergencyFlowService();