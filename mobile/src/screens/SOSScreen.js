// src/screens/SOSScreen.js
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

const SOSScreen = ({ route }) => {
  const { sendSOS, isActive } = useContext(GuardianContext);
  const navigation = useNavigation();
  const lat = route?.params?.lat;
  const lng = route?.params?.lng;

  const pulseAnim = new Animated.Value(0);

  // Auto pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  // Auto-dismiss after 3 seconds if SOS was sent
  useEffect(() => {
    if (route?.params?.autoSent) {
      const timer = setTimeout(() => {
        navigation.goBack();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.autoSent, navigation]);

  const handleAlertSOS = async () => {
    if (!isActive) {
      // Alert already shown by context
      return;
    }

    await sendSOS(
      lat && lng ? { latitude: lat, longitude: lng } : null
    );
    
    // Auto dismiss after sending
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* SOS Status */}
        <Text style={styles.statusLabel}>
          {route?.params?.autoSent ? '✅ SOS SENT' : '🚨 SEND SOS'}
        </Text>

        {/* Pulsing Circle */}
        <Animated.View
          style={[
            styles.pulseContainer,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        >
          <View style={styles.sosCircle}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </Animated.View>

        {/* Details */}
        <Text style={styles.message}>
          {route?.params?.autoSent
            ? 'Emergency alerts sent to your guardians'
            : 'Tap the button below to alert your guardians'}
        </Text>

        {/* Location Info (if available) */}
        {lat && lng && (
          <View style={styles.locationBox}>
            <Text style={styles.locationLabel}>📍 Location:</Text>
            <Text style={styles.locationCoords}>
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Send SOS Button (hide if already sent) */}
        {!route?.params?.autoSent && (
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handleAlertSOS}
          >
            <Text style={styles.sosButtonText}>SEND SOS ALERT</Text>
          </TouchableOpacity>
        )}

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>
            {route?.params?.autoSent ? 'CONTINUE' : 'CANCEL'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pulseContainer: {
    marginVertical: SPACING.xl,
  },
  sosCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  sosText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#ffffff',
  },
  message: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    lineHeight: 26,
  },
  locationBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderLeftWidth: 4,
    borderLeftColor: '#14b8a6',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginVertical: SPACING.lg,
    width: '100%',
  },
  locationLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14b8a6',
  },
  sosButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    marginVertical: SPACING.md,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  closeButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#64748b',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default SOSScreen;