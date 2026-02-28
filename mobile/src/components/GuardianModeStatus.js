/**
 * GuardianModeStatus.js
 * 
 * Component for viewing and controlling Guardian Mode status
 * Shows gesture detection state, SOS readiness, and emergency contact info
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { ShieldCheckIcon, UsersIcon, MapPinIcon, BoltIcon } from 'react-native-heroicons/outline';
import GestureDetectionService from '../services/GestureDetectionService';
import LocationService from '../services/LocationService';
import SOSService from '../services/SOSService';

const GuardianModeStatus = ({
  isGuardianEnabled,
  onToggleGuardian,
  onManageContacts,
  onSimulateGesture,
}) => {
  const [gestureStatus, setGestureStatus] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [sosStatus, setSOSStatus] = useState(null);
  const [contactCount, setContactCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh status
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const gestures = GestureDetectionService.getStatus();
        const location = LocationService.getStatus();
        const sos = SOSService.getStatus();

        // Get emergency contacts
        const contacts = await SOSService.getEmergencyContacts();

        setGestureStatus(gestures);
        setLocationStatus(location);
        setSOSStatus(sos);
        setContactCount(contacts.length);
      } catch (error) {
        console.error('❌ Error updating status:', error);
      }
    };

    updateStatus();

    // Update every 2 seconds
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, [isGuardianEnabled]);

  const getStatusColor = (isActive) => {
    return isActive ? '#4CAF50' : '#999';
  };

  const handleToggle = async (value) => {
    try {
      setIsLoading(true);
      await onToggleGuardian(value);
    } catch (error) {
      console.error('❌ Error toggling Guardian:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
        <View style={styles.header}>
          <ShieldCheckIcon size={32} color={isGuardianEnabled ? '#FF0000' : '#999'} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Guardian Mode</Text>
          <Text
            style={[
              styles.headerStatus,
              {
                color: isGuardianEnabled ? '#4CAF50' : '#F44336',
              },
            ]}
          >
            {isGuardianEnabled ? '🔒 ACTIVE' : '🔓 Inactive'}
          </Text>
        </View>

        {/* Toggle Switch */}
        <Switch
          value={isGuardianEnabled}
          onValueChange={handleToggle}
          disabled={isLoading}
          trackColor={{ false: '#767577', true: '#81C784' }}
          thumbColor={isGuardianEnabled ? '#4CAF50' : '#f4f3f4'}
          style={styles.toggle}
        />
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color="#FF0000" />
      )}

      {isGuardianEnabled && (
        <>
          {/* Gesture Detection Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <BoltIcon size={20} color={getStatusColor(gestureStatus?.isActive)} />
              <Text style={styles.statusTitle}>Triple-Tap Detection</Text>
              <Text
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: gestureStatus?.isActive
                      ? '#4CAF50'
                      : '#999',
                  },
                ]}
              >
                {gestureStatus?.isActive ? 'READY' : 'OFF'}
              </Text>
            </View>

            {gestureStatus && (
              <View style={styles.statusDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Taps Detected:</Text>
                  <Text style={styles.detailValue}>
                    {gestureStatus.currentTaps} / {gestureStatus.requiredTaps}
                  </Text>
                </View>

                {gestureStatus.inCooldown && (
                  <View style={styles.cooldownIndicator}>
                    <AlertCircle size={16} color="#FF9800" />
                    <Text style={styles.cooldownText}>
                      Cooldown active (
                      {Math.ceil(gestureStatus.timeUntilCooldown / 1000)}s)
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={onSimulateGesture}
                  disabled={gestureStatus.inCooldown}
                >
                  <Text style={styles.testButtonText}>
                    🧪 Test Triple-Tap
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Location Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MapPin
                size={20}
                color={getStatusColor(locationStatus?.hasLocation)}
              />
              <Text style={styles.statusTitle}>Location Service</Text>
              <Text
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: locationStatus?.hasLocation
                      ? '#4CAF50'
                      : '#FF9800',
                  },
                ]}
              >
                {locationStatus?.hasLocation ? 'READY' : 'NO FIX'}
              </Text>
            </View>

            {locationStatus && (
              <View style={styles.statusDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Permission:</Text>
                  <Text style={styles.detailValue}>
                    {locationStatus.permissionStatus === 'granted'
                      ? '✅ Granted'
                      : '❌ Denied'}
                  </Text>
                </View>

                {locationStatus.hasLocation && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Fix:</Text>
                      <Text style={styles.detailValue}>
                        {locationStatus.lastLocation?.accuracy.toFixed(1)}m
                        accuracy
                      </Text>
                    </View>

                    <Text style={styles.locationNote}>
                      {locationStatus.lastLocation?.isCached
                        ? 'Cached location'
                        : 'Live GPS'}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* SOS Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <AlertCircle
                size={20}
                color={getStatusColor(!sosStatus?.inCooldown)}
              />
              <Text style={styles.statusTitle}>SOS Status</Text>
              <Text
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: sosStatus?.inCooldown
                      ? '#FF9800'
                      : '#4CAF50',
                  },
                ]}
              >
                {sosStatus?.inCooldown ? 'COOLDOWN' : 'READY'}
              </Text>
            </View>

            {sosStatus && (
              <View style={styles.statusDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Trigger:</Text>
                  <Text style={styles.detailValue}>
                    {sosStatus.lastSOSTime
                      ? new Date(sosStatus.lastSOSTime).toLocaleTimeString()
                      : 'Never'}
                  </Text>
                </View>

                {sosStatus.inCooldown && (
                  <View style={styles.cooldownIndicator}>
                    <AlertCircle size={16} color="#FF9800" />
                    <Text style={styles.cooldownText}>
                      Cooldown: {Math.ceil(sosStatus.timeUntilCooldown / 1000)}s
                      remaining
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Emergency Contacts */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Users size={20} color="#2196F3" />
              <Text style={styles.statusTitle}>Emergency Contacts</Text>
              <Text style={styles.contactBadge}>{contactCount}</Text>
            </View>

            {contactCount === 0 ? (
              <Text style={styles.warningText}>
                ⚠️ No emergency contacts configured
              </Text>
            ) : (
              <Text style={styles.successText}>
                ✅ {contactCount} contact{contactCount !== 1 ? 's' : ''} ready
              </Text>
            )}

            <TouchableOpacity
              style={styles.manageButton}
              onPress={onManageContacts}
            >
              <Text style={styles.manageButtonText}>
                Manage Contacts
              </Text>
            </TouchableOpacity>
          </View>

          {/* System Integration */}
          <View style={styles.statusCard}>
            <Text style={styles.systemTitle}>🔧 System Integration</Text>

            <View style={styles.systemList}>
              <View style={styles.systemItem}>
                <Text style={styles.systemLabel}>
                  {gestureStatus?.isActive ? '✅' : '❌'} Gesture Detection
                </Text>
              </View>

              <View style={styles.systemItem}>
                <Text style={styles.systemLabel}>
                  {locationStatus?.hasLocation
                    ? '✅'
                    : '⚠️'} GPS Location
                </Text>
              </View>

              <View style={styles.systemItem}>
                <Text style={styles.systemLabel}>
                  {contactCount > 0 ? '✅' : '⚠️'} Emergency Contacts
                </Text>
              </View>

              <View style={styles.systemItem}>
                <Text style={styles.systemLabel}>
                  🔒 Secure Storage
                </Text>
              </View>
            </View>
          </View>

          {/* Configuration Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for Best Performance</Text>
            <Text style={styles.tipItem}>
              • Keep location services enabled
            </Text>
            <Text style={styles.tipItem}>
              • Add multiple emergency contacts
            </Text>
            <Text style={styles.tipItem}>
              • Test triple-tap regularly
            </Text>
            <Text style={styles.tipItem}>
              • Ensure good GPS signal
            </Text>
            <Text style={styles.tipItem}>
              • Battery saver disabled recommended
            </Text>
          </View>
        </>
      )}

      {!isGuardianEnabled && (
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledText}>
            Enable Guardian Mode to activate protection
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  toggle: {
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  contactBadge: {
    backgroundColor: '#2196F3',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  locationNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  cooldownIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
    gap: 8,
  },
  cooldownText: {
    fontSize: 12,
    color: '#FF9800',
    flex: 1,
  },
  testButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  warningText: {
    color: '#F44336',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  systemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  systemList: {
    gap: 8,
  },
  systemItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  systemLabel: {
    fontSize: 13,
    color: '#333',
  },
  tipsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 12,
    color: '#388E3C',
    marginVertical: 4,
    lineHeight: 18,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  disabledText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default GuardianModeStatus;
