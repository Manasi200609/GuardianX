// src/services/locationTracking.js
// Background Location Tracking Service
// Continuously tracks user location when Guardian Mode is active

import * as Location from 'expo-location';

/**
 * Location Tracking Service
 * 
 * Provides continuous location tracking for Guardian Mode:
 * - High-accuracy GPS tracking
 * - Background location updates
 * - Route monitoring
 * - Location history
 */
class LocationTrackingService {
  constructor() {
    this.isTracking = false;
    this.locationSubscription = null;
    this.onLocationUpdate = null;
    this.currentLocation = null;
    this.locationHistory = [];
    this.MAX_HISTORY_SIZE = 100; // Keep last 100 locations
  }

  /**
   * Initialize location tracking
   * @param {Function} onLocationCallback - Called when location updates
   */
  initialize(onLocationCallback) {
    this.onLocationUpdate = onLocationCallback;
    console.log('✅ Location Tracking Service initialized');
  }

  /**
   * Start location tracking
   */
  async startTracking() {
    if (this.isTracking) {
      console.log('⚠️ Location tracking already active');
      return;
    }

    try {
      // Request foreground location permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission denied');
      }

      // Request background location permissions
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('⚠️ Background location permission denied (foreground tracking only)');
      }

      // Configure location options
      const locationOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
        mayShowUserSettingsDialog: true,
      };

      // Start location updates
      this.locationSubscription = await Location.watchPositionAsync(
        locationOptions,
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      this.isTracking = true;
      console.log('📍 Location tracking started');

      // Get initial location immediately
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      this.handleLocationUpdate(initialLocation);
    } catch (error) {
      console.error('❌ Failed to start location tracking:', error);
      this.isTracking = false;
      throw error;
    }
  }

  /**
   * Stop location tracking
   */
  stopTracking() {
    if (!this.isTracking) {
      return;
    }

    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    this.isTracking = false;
    console.log('🛑 Location tracking stopped');
  }

  /**
   * Handle location update
   * @param {Object} location - Location data from expo-location
   */
  handleLocationUpdate(location) {
    const locationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      timestamp: new Date(location.timestamp),
    };

    this.currentLocation = locationData;

    // Add to history
    this.locationHistory.push(locationData);
    if (this.locationHistory.length > this.MAX_HISTORY_SIZE) {
      this.locationHistory.shift(); // Remove oldest
    }

    // Call callback
    if (this.onLocationUpdate) {
      this.onLocationUpdate(locationData);
    }

    console.log(`📍 Location updated: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`);
  }

  /**
   * Get current location
   * @returns {Object|null} - Current location data
   */
  getCurrentLocation() {
    return this.currentLocation;
  }

  /**
   * Get location history
   * @param {number} limit - Maximum number of locations to return
   * @returns {Array} - Location history
   */
  getLocationHistory(limit = 10) {
    return this.locationHistory.slice(-limit);
  }

  /**
   * Calculate distance between two coordinates (in meters)
   * @param {Object} loc1 - Location 1 {latitude, longitude}
   * @param {Object} loc2 - Location 2 {latitude, longitude}
   * @returns {number} - Distance in meters
   */
  calculateDistance(loc1, loc2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Detect route deviation
   * @param {Array} plannedRoute - Array of waypoints {latitude, longitude}
   * @param {number} thresholdMeters - Maximum deviation threshold
   * @returns {boolean} - True if deviated from route
   */
  detectRouteDeviation(plannedRoute, thresholdMeters = 50) {
    if (!this.currentLocation || !plannedRoute || plannedRoute.length === 0) {
      return false;
    }

    // Find nearest point on route
    let minDistance = Infinity;
    for (const waypoint of plannedRoute) {
      const distance = this.calculateDistance(this.currentLocation, waypoint);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance > thresholdMeters;
  }
}

// Singleton instance
const locationTrackingService = new LocationTrackingService();

export default locationTrackingService;

