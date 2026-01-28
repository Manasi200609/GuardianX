// src/screens/EmergencyDetectedScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, RADIUS, FONT } from '../utils/theme';
import emergencyFlowService from '../services/emergencyFlow';

const EmergencyDetectedScreen = () => {
  const route = useRoute();
  const { user, isActive } = useContext(GuardianContext);
  const { triggerType = 'manual', gestureData } = route.params || {};

  const [status, setStatus] = useState('processing');
  const [emergencyData, setEmergencyData] = useState(null);
  const [error, setError] = useState(null);

  const gradientColors = isActive
    ? ['#0F172A', '#1E293B', '#0F172A']
    : ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

  const textColor = isActive ? '#e5e7eb' : COLORS.text;
  const subtextColor = isActive ? '#94a3b8' : COLORS.textSecondary;
  const cardBgColor = isActive ? '#1E293B' : '#FFFFFF';
  const borderColor = isActive ? '#334155' : '#e2e8f0';

  useEffect(() => {
    handleEmergency();
  }, []);

  const handleEmergency = async () => {
    if (!user?._id) {
      setError('User not logged in');
      setStatus('error');
      return;
    }

    try {
      console.log('🚨 Processing emergency...');
      
      const result = await emergencyFlowService.triggerEmergency(
        user._id,
        triggerType,
        { gestureData }
      );

      if (result.success) {
        setEmergencyData(result);
        setStatus('success');
        console.log('✅ Emergency processed successfully');
      } else {
        setError(result.message || 'Failed to process emergency');
        setStatus('error');
      }
    } catch (err) {
      console.error('❌ Emergency processing error:', err);
      setError(err.message || 'An error occurred');
      setStatus('error');
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar 
        barStyle={isActive ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isActive ? '#7f1d1d' : '#fee2e2' }]}>
            <Text style={styles.icon}>🚨</Text>
          </View>
          <Text style={[styles.title, { color: textColor }]}>Emergency Detected</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>Help is on the way</Text>
        </View>

        {/* Status Content */}
        {status === 'processing' && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.statusText, { color: textColor }]}>Sending emergency alert...</Text>
            <Text style={[styles.statusSubtext, { color: subtextColor }]}>
              Your location is being shared with emergency contacts
            </Text>
          </View>
        )}

        {status === 'success' && emergencyData && (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: isActive ? '#1e7e34' : '#dcfce7' }]}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text style={[styles.successTitle, { color: textColor }]}>Alert Sent Successfully</Text>
            <Text style={[styles.successText, { color: subtextColor }]}>
              Your emergency contacts have been notified
            </Text>

            {emergencyData.location && (
              <View style={[styles.infoCard, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
                <Text style={[styles.infoCardTitle, { color: textColor }]}>Location Shared</Text>
                <Text style={[styles.infoCardText, { color: COLORS.primary }]}>
                  {emergencyData.location.latitude?.toFixed(6)},{' '}
                  {emergencyData.location.longitude?.toFixed(6)}
                </Text>
                {emergencyData.location.address && (
                  <Text style={[styles.infoCardAddress, { color: subtextColor }]}>
                    {emergencyData.location.address}
                  </Text>
                )}
              </View>
            )}

            {emergencyData.contactsNotified > 0 && (
              <View style={[styles.infoCard, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
                <Text style={[styles.infoCardTitle, { color: textColor }]}>Contacts Notified</Text>
                <Text style={[styles.infoCardText, { color: COLORS.success }]}>
                  {emergencyData.contactsNotified} contact(s) received your alert
                </Text>
              </View>
            )}

            <View style={[styles.infoCard, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
              <Text style={[styles.infoCardTitle, { color: textColor }]}>Trigger Type</Text>
              <Text style={[styles.infoCardText, { color: textColor }]}>
                {triggerType === 'gesture' && '👊 Hand Gesture Detected'}
                {triggerType === 'manual' && '⚠️ Manual Alert'}
                {triggerType === 'motion' && '📳 Motion Detected'}
                {triggerType === 'route_deviation' && '🗺️ Route Deviation'}
              </Text>
            </View>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorTitle, { color: textColor }]}>Alert Sent</Text>
            <Text style={[styles.errorText, { color: subtextColor }]}>
              {error || 'Emergency alert has been sent. Some services may be unavailable.'}
            </Text>
            <Text style={[styles.errorSubtext, { color: subtextColor }]}>
              Your contacts have been notified via SMS
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
          <Text style={[styles.instructionsTitle, { color: textColor }]}>What Happens Next</Text>
          <Text style={[styles.instructionsText, { color: subtextColor }]}>
            • Your emergency contacts have received your location{'\n'}
            • Stay calm and wait for help{'\n'}
            • If safe, you can call emergency services directly{'\n'}
            • Your location will continue to be tracked
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default EmergencyDetectedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.body,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  statusText: {
    fontSize: FONT.body,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  statusSubtext: {
    fontSize: FONT.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successCheckmark: {
    fontSize: 40,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  successText: {
    fontSize: FONT.body,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
  },
  infoCardTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  infoCardText: {
    fontSize: FONT.body,
    fontWeight: '600',
  },
  infoCardAddress: {
    fontSize: FONT.caption,
    marginTop: SPACING.xs,
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  errorIcon: {
    fontSize: 50,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: FONT.body,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: FONT.caption,
  },
  instructionsCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  instructionsTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  instructionsText: {
    fontSize: FONT.body,
    lineHeight: 24,
  },
});