// src/screens/DashboardScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import SurfaceCard from '../components/SurfaceCard';
import { COLORS, SPACING, FONT } from '../utils/theme';

const DashboardScreen = ({ navigation }) => {
  const [guardianActive, setGuardianActive] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [locationError, setLocationError] = React.useState(null);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
      setLocationError(null);
    } catch (e) {
      setLocationError('Could not get location');
    }
  };

  const toggleGuardian = async () => {
    const next = !guardianActive;
    setGuardianActive(next);

    if (next) {
      await startLocationTracking();
    } else {
      setLocation(null);
      setLocationError(null);
    }
  };

  const handleCall = () => {
    Alert.alert('Call 112', 'Here you will start a call to emergency services.');
  };

  const handleAlert = () => {
    Alert.alert('Alert sent', 'GuardianX would notify your emergency contacts.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.appName}>GuardianX</Text>
          <Text style={styles.tagline}>Your safety companion</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            {/* Replace with real icon later */}
            <View style={styles.settingsIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Big shield button */}
      <TouchableOpacity onPress={toggleGuardian}>
        <SurfaceCard
          style={styles.guardianCard}
          variant={guardianActive ? 'highlight' : 'default'}
        >
          <View
            style={[
              styles.shieldCircle,
              guardianActive && styles.shieldCircleActive,
            ]}
          />
          <Text style={styles.guardianTitle}>
            {guardianActive ? 'GUARDIAN ACTIVE' : 'TAP TO ACTIVATE'}
          </Text>
        </SurfaceCard>
      </TouchableOpacity>

      {/* Status + location card when active */}
      {guardianActive && (
        <SurfaceCard style={styles.statusCard}>
          <Text style={styles.statusTitle}>Guardian Active</Text>
          <Text style={styles.statusSubtitle}>
            Monitoring your safety
          </Text>

          {location && (
            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>Location Tracking</Text>
              <Text style={styles.locationValue}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
        </SurfaceCard>
      )}

      {/* Two small cards */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.col}
          onPress={() => navigation.navigate('Contacts')}
        >
          <SurfaceCard>
            <Text style={styles.cardTitle}>Contacts</Text>
            <Text style={styles.cardSubtitle}>2 configured</Text>
          </SurfaceCard>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.col}
          onPress={() => navigation.navigate('Gesture')}
        >
          <SurfaceCard>
            <Text style={styles.cardTitle}>Gesture</Text>
            <Text style={styles.cardSubtitle}>Triple tap</Text>
          </SurfaceCard>
        </TouchableOpacity>
      </View>

      {/* Wide safe route card */}
      <SurfaceCard style={{ marginTop: SPACING.lg }}>
        <Text style={styles.cardTitle}>Plan Safe Route</Text>
        <Text style={styles.cardSubtitle}>
          Find the safest path to your destination
        </Text>
      </SurfaceCard>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.actionCard, styles.callCard]}
          onPress={handleCall}
        >
          <Text style={styles.actionLabel}>Call 112</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.alertCard]}
          onPress={handleAlert}
        >
          <Text style={styles.actionLabel}>Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.routeCard]}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.actionLabel}>Safe Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.contactsCard]}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.actionLabel}>Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  appName: {
    color: COLORS.textPrimary,
    fontSize: FONT.title,
    fontWeight: '700',
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  guardianCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shieldCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  shieldCircleActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  guardianTitle: {
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  statusCard: {
    marginBottom: SPACING.xxl,
  },
  statusTitle: {
    color: COLORS.accent,
    fontSize: FONT.subtitle,
    fontWeight: '600',
  },
  statusSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginTop: SPACING.xs,
  },
  locationBlock: {
    marginTop: SPACING.lg,
  },
  locationLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT.caption,
    marginBottom: SPACING.xs,
  },
  locationValue: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '500',
  },
  errorText: {
    marginTop: SPACING.lg,
    color: '#F97373',
    fontSize: FONT.caption,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  col: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.caption,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    flex: 1,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionLabel: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '600',
  },
  callCard: {
    backgroundColor: '#7F1D1D',
  },
  alertCard: {
    backgroundColor: '#7C2D12',
  },
  routeCard: {
    backgroundColor: '#0F172A',
  },
  contactsCard: {
    backgroundColor: '#111827',
  },
});

export default DashboardScreen;
