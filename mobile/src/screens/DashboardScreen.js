// src/screens/DashboardScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import SurfaceCard from '../components/SurfaceCard';
import { COLORS, SPACING, FONT } from '../utils/theme';

const DashboardScreen = ({ navigation }) => {
  const [guardianActive, setGuardianActive] = React.useState(false);
  const [location, setLocation] = React.useState(null);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Enable location to use GuardianX properly.'
        );
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    } catch (e) {
      Alert.alert('Error', 'Could not get your location.');
    }
  };

  const toggleGuardian = async () => {
    const next = !guardianActive;
    setGuardianActive(next);
    if (next) {
      await startLocationTracking();
    } else {
      setLocation(null);
    }
  };

  const handleCall = () => {
    Alert.alert('Call 112', 'Here you will start a call to emergency services.');
  };

  const handleAlert = () => {
    Alert.alert('Alert sent', 'GuardianX would notify your emergency contacts.');
  };

  return (
    <View style={styles.screen}>
      {/* TOP GRADIENT HEADER */}
      <LinearGradient
        colors={['#020617', '#020617']}
        style={styles.headerBackground}
      >
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.appName}>GuardianX</Text>
            <Text style={styles.tagline}>Your safety companion</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => {}}
            >
              <Image
                source={require('../../assets/history.png')}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image
                source={require('../../assets/settings.jpg')}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* BIG SHIELD */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleGuardian}
          style={styles.shieldWrapper}
        >
          <LinearGradient
            colors={
              guardianActive
                ? ['#22c55e', '#0ea5e9']
                : ['#0f172a', '#020617']
            }
            style={styles.shieldOuter}
          >
            <View style={styles.shieldMiddle}>
              <View style={styles.shieldInner}>
                <Image
                  source={require('../../assets/shield-line.png')}
                  style={styles.shieldIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </LinearGradient>
          <Text style={styles.guardianLabel}>
            {guardianActive ? 'GUARDIAN ACTIVE' : 'TAP TO ACTIVATE'}
          </Text>
          <Text style={styles.guardianSubLabel}>
            Monitoring your safety
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* CONTENT CARDS */}
      <View style={styles.content}>
        {/* LOCATION CARD */}
        {guardianActive && (
          <SurfaceCard style={styles.locationCard}>
            <View style={styles.locationHeaderRow}>
              <View style={styles.locationIconCircle}>
                <Text style={styles.locationIconText}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Location Tracking</Text>
                <Text style={styles.locationStatus}>Active &amp; Sharing</Text>
              </View>
            </View>

            <View style={styles.locationDetailRow}>
              <Text style={styles.detailLabel}>Coordinates</Text>
              <Text style={styles.detailValue}>
                {location
                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(
                      4
                    )}`
                  : '-- , --'}
              </Text>
            </View>

            <View style={styles.locationDetailRow}>
              <Text style={styles.detailLabel}>Last Update</Text>
              <Text style={styles.detailValue}>Just now</Text>
            </View>

            <View style={styles.locationDetailRow}>
              <Text style={styles.detailLabel}>Accuracy</Text>
              <Text style={styles.detailAccent}>±14 m</Text>
            </View>
          </SurfaceCard>
        )}

        {/* GESTURE CARD */}
        <SurfaceCard style={styles.gestureCard}>
          <View style={styles.gestureLeft}>
            <View style={styles.gestureIconCircle}>
              <Text style={styles.locationIconText}>🎛️</Text>
            </View>
            <View>
              <Text style={styles.locationTitle}>Gesture Detection</Text>
              <Text style={styles.gestureSubtitle}>
                Triple tap • high sensitivity
              </Text>
            </View>
          </View>
          <View style={styles.gestureDot} />
        </SurfaceCard>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.actionTile, styles.callTile]}
            onPress={handleCall}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Call 112</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, styles.alertTile]}
            onPress={handleAlert}
          >
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionText}>Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, styles.routeTile]}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionText}>Safe Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, styles.contactsTile]}
            onPress={() => navigation.navigate('Contacts')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Contacts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },
  headerBackground: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  appName: {
    color: '#e5e7eb',
    fontSize: FONT.subtitle,
    fontWeight: '700',
  },
  tagline: {
    color: '#6b7280',
    fontSize: FONT.caption,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: '#9ca3af',
  },

  shieldWrapper: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  shieldOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldMiddle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldIcon: {
    width: 80,
    height: 80,
    tintColor: 'white',
  },
  guardianLabel: {
    marginTop: SPACING.md,
    color: '#38bdf8',
    letterSpacing: 3,
    fontWeight: '600',
  },
  guardianSubLabel: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: FONT.caption,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  locationCard: {
    borderRadius: 24,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#022c22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationIconText: {
    fontSize: 20,
  },
  locationTitle: {
    color: '#e5e7eb',
    fontSize: FONT.body,
    fontWeight: '600',
  },
  locationStatus: {
    color: '#22c55e',
    fontSize: FONT.caption,
    marginTop: 2,
  },
  locationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: FONT.caption,
  },
  detailValue: {
    color: '#e5e7eb',
    fontSize: FONT.caption,
  },
  detailAccent: {
    color: '#22c55e',
    fontSize: FONT.caption,
  },

  gestureCard: {
    borderRadius: 24,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gestureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gestureIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  gestureSubtitle: {
    color: '#9ca3af',
    fontSize: FONT.caption,
    marginTop: 2,
  },
  gestureDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionTile: {
    flex: 1,
    height: 82,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    color: '#e5e7eb',
    fontSize: FONT.caption,
    fontWeight: '600',
  },
  callTile: {
    backgroundColor: '#7f1d1d',
  },
  alertTile: {
    backgroundColor: '#78350f',
  },
  routeTile: {
    backgroundColor: '#0f172a',
  },
  contactsTile: {
    backgroundColor: '#1e1b4b',
  },
});
