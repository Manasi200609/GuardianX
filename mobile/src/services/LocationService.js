/**
 * LocationService.js
 * 
 * Handles GPS location retrieval with high accuracy and error handling
 * 
 * Features:
 * - High accuracy location detection
 * - Timeout handling for GPS locks
 * - Permission management
 * - Offline fallback (cached location)
 * - Accuracy verification
 * - Error recovery
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationService {
  constructor() {
    this.lastKnownLocation = null;
    this.permissionStatus = null;
    this.isTracking = false;
    this.locationWatcherId = null;
    this.cacheKey = '@guardian_last_location';
  }

  /**
   * Request location permissions
   * @returns {Promise<boolean>} - True if permission granted
   */
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.permissionStatus = status;

      if (status === 'granted') {
        console.log('✅ Location permission granted');
        
        // Also request background permission if available (Android 10+)
        try {
          const bgStatus = await Location.requestBackgroundPermissionsAsync();
          console.log('📍 Background location permission:', bgStatus.status);
        } catch (error) {
          console.warn('⚠️ Background location permission not available:', error);
        }
        
        return true;
      } else {
        console.error('❌ Location permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to request location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are already granted
   * @returns {Promise<boolean>}
   */
  async checkPermissions() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.permissionStatus = status;
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location with high accuracy
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Location object with coordinates and accuracy
   */
  async getCurrentLocation(options = {}) {
    const {
      timeout = 30000, // 30 second timeout
      maxAge = 0, // Don't use cached location
      enableHighAccuracy = true,
      accuracy = Location.Accuracy.Highest, // Highest accuracy available
    } = options;

    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Location permission not granted');
        return this.getLastKnownLocation();
      }

      console.log('📡 Requesting high-accuracy location...');

      // Get position with timeout
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy,
          mayShowUserSettingsDialog: true,
          timeoutMs: timeout / 2, // Internal timeout
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Location request timeout')),
            timeout
          )
        ),
      ]);

      if (!location || !location.coords) {
        throw new Error('Invalid location response');
      }

      const processedLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
        provider: 'GPS',
        isCached: false,
      };

      // Validate accuracy
      if (processedLocation.accuracy > 100) {
        console.warn(
          `⚠️ Location accuracy is ${processedLocation.accuracy}m (higher than ideal)`
        );
      } else {
        console.log(
          `✅ Location acquired with ${processedLocation.accuracy.toFixed(1)}m accuracy`
        );
      }

      // Cache the location
      this.lastKnownLocation = processedLocation;
      await this.cacheLocation(processedLocation);

      return processedLocation;
    } catch (error) {
      console.error('❌ Error getting current location:', error.message);

      // Fallback to last known location
      const cachedLocation = await this.getLastKnownLocation();
      if (cachedLocation) {
        console.log('📍 Using last known location as fallback');
        return cachedLocation;
      }

      // If no cached location, return error
      throw new Error(`Location unavailable: ${error.message}`);
    }
  }

  /**
   * Cache location to AsyncStorage for offline access
   * @param {Object} location - Location object
   */
  async cacheLocation(location) {
    try {
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(location));
      console.log('💾 Location cached');
    } catch (error) {
      console.warn('⚠️ Failed to cache location:', error);
    }
  }

  /**
   * Get last known location from cache
   * @returns {Promise<Object|null>} - Cached location or null
   */
  async getLastKnownLocation() {
    try {
      if (this.lastKnownLocation) {
        return { ...this.lastKnownLocation, isCached: true };
      }

      const cached = await AsyncStorage.getItem(this.cacheKey);
      if (cached) {
        this.lastKnownLocation = JSON.parse(cached);
        return { ...this.lastKnownLocation, isCached: true };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve cached location:', error);
      return null;
    }
  }

  /**
   * Start watching location changes (for real-time updates)
   * @param {Function} callback - Function called when location changes
   * @param {Object} options - Configuration options
   */
  async startLocationTracking(callback, options = {}) {
    const {
      accuracy = Location.Accuracy.BestForNavigation,
      timeInterval = 5000, // Update every 5 seconds
      distanceInterval = 0, // Update on any movement
    } = options;

    try {
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      // Stop existing watcher if active
      if (this.locationWatcherId !== null) {
        await Location.removeWatchAsync(this.locationWatcherId);
      }

      console.log('🔍 Starting location tracking...');

      this.locationWatcherId = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval,
        },
        (location) => {
          const processedLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
            provider: 'GPS',
            isCached: false,
          };

          // Update cached location
          this.lastKnownLocation = processedLocation;

          // Call callback
          callback(processedLocation);
        }
      );

      this.isTracking = true;
      console.log('✅ Location tracking started');
    } catch (error) {
      console.error('❌ Failed to start location tracking:', error);
      throw error;
    }
  }

  /**
   * Stop location tracking
   */
  async stopLocationTracking() {
    try {
      if (this.locationWatcherId !== null) {
        await Location.removeWatchAsync(this.locationWatcherId);
        this.locationWatcherId = null;
        this.isTracking = false;
        console.log('🛑 Location tracking stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping location tracking:', error);
    }
  }

  /**
   * Check if device has GPS capability
   * @returns {Promise<boolean>}
   */
  async hasLocationProvider() {
    try {
      const providers = await Location.getProviderStatusAsync();
      return providers.locationServicesEnabled;
    } catch (error) {
      console.error('❌ Error checking location provider:', error);
      return false;
    }
  }

  /**
   * Reverse geocode coordinates to address (if needed)
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object|null>}
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        return {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: `${address.street}, ${address.city}, ${address.region}`,
        };
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Get current location status
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      hasLocation: !!this.lastKnownLocation,
      lastLocation: this.lastKnownLocation,
      permissionStatus: this.permissionStatus,
    };
  }

  /**
   * Validate location accuracy
   * @param {Object} location - Location object
   * @param {number} threshold - Acceptable accuracy in meters (default 50m)
   * @returns {boolean}
   */
  isAccurate(location, threshold = 50) {
    return location && location.accuracy <= threshold;
  }

  /**
   * Cleanup service
   */
  async destroy() {
    await this.stopLocationTracking();
    this.lastKnownLocation = null;
    console.log('🗑️ LocationService destroyed');
  }
}

// Export singleton instance
export default new LocationService();
