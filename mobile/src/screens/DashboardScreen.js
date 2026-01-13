// src/screens/DashboardScreen.js
import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import { GuardianContext } from '../context/GuardianContext';
import { triggerSOS, API_BASE_URL } from '../services/api';


const DashboardScreen = ({ navigation: propNavigation, route }) => {
  const navigation = useNavigation();
  const { sendSOS, isActive, toggleGuardian } = useContext(GuardianContext);

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showSOSSheet, setShowSOSSheet] = useState(false);

  // user passed from Login → Dashboard
  const user = route?.params?.user || null;

  // triple‑tap simulation state (Gesture card)
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  // motion detection subscription
  const [motionSub, setMotionSub] = useState(null);
  const SHAKE_THRESHOLD = 1.8;
  const WINDOW_MS = 800;
  const lastShakeTime = useRef(0);

  const handleGestureCardPress = () => {
    const now = Date.now();
    const TAP_WINDOW = 1000; // 3 taps within 1 second

    if (now - lastTapRef.current > TAP_WINDOW) {
      tapCountRef.current = 0;
    }

    tapCountRef.current += 1;
    lastTapRef.current = now;

    if (tapCountRef.current === 3) {
      tapCountRef.current = 0;
      sendSOS();
      Alert.alert('SOS Triggered', 'Triple‑tap gesture activated SOS.');
    }
  };

  // --- MOTION / SHAKE DETECTION ---
  const handleMotionData = ({ x, y, z }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (magnitude > SHAKE_THRESHOLD) {
      if (now - lastShakeTime.current < WINDOW_MS) {
        lastShakeTime.current = 0;
        sendSOS();
        Alert.alert('SOS Triggered', 'Rigorous phone movement activated SOS.');
      } else {
        lastShakeTime.current = now;
      }
    }
  };

  const subscribeMotion = () => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(handleMotionData);
    setMotionSub(sub);
  };

  const unsubscribeMotion = () => {
    if (motionSub) {
      motionSub.remove();
      setMotionSub(null);
    }
  };

  const handleAlertSOS = async () => {
  try {
    if (!user || !user._id) {
      console.log('Dashboard: user missing in route.params', route?.params);
      Alert.alert('Error', 'User information is missing for SOS.');
      return;
    }

    const lat = location?.latitude;
    const lng = location?.longitude;

    // Log to verify the exact URL shape indirectly
    console.log(
      'Dashboard SOS call → base =',
      API_BASE_URL,
      'userId =',
      user._id,
      'lat =',
      lat,
      'lng =',
      lng
    );

    // Use the shared helper: POST /api/users/:id/sos
    const res = await triggerSOS(user._id, { lat, lng });
    console.log('SOS response:', res.data);

    setShowSOSSheet(true);
  } catch (err) {
    console.error('SOS error:', err.response?.data || err.message);
    Alert.alert('Error', 'Server error sending SOS.');
  }
};

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

  // react when Guardian mode changes in context
  useEffect(() => {
    if (isActive) {
      startLocationTracking();
      subscribeMotion();
    } else {
      unsubscribeMotion();
      setLocation(null);
      setLocationError(null);
    }
  }, [isActive]);

  const handleCall = () => {
    Alert.alert('Call 112', 'Here you will start a call to emergency services.');
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeMotion();
    };
  }, []);

  return (
    <View style={styles.app}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brand}>
            <View style={styles.brandRow}>
              <View style={styles.brandLogoCircle}>
                <Image
                  source={require('../../assets/icon.jpeg')}
                  style={styles.brandLogoImg}
                />
              </View>
              <Text style={styles.brandTitle}>GuardianX</Text>
            </View>
            <Text style={styles.brandSubtitle}>Your safety companion</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <Text style={styles.iconLabel}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <View>
              <Image
                source={require('../../assets/menu.png')}
                style={styles.headerIconImg}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* SHIELD AREA */}
      <TouchableOpacity onPress={toggleGuardian} activeOpacity={0.9}>
        <View style={styles.shieldSection}>
          <View
            style={[
              styles.shieldOuter,
              isActive ? styles.shieldOuterActive : styles.shieldOuterInactive,
            ]}
          >
            <View style={styles.shieldMiddle}>
              <View
                style={[
                  styles.shieldInner,
                  isActive ? styles.shieldInnerActive : styles.shieldInnerInactive,
                ]}
              >
                <Image
                  source={
                    isActive
                      ? require('../../assets/s2.png')
                      : require('../../assets/s1.png')
                  }
                  style={styles.shieldImg}
                />
              </View>
            </View>
          </View>
        </View>
        <View>
          <Text
            style={[
              styles.guardianLabel,
              isActive ? styles.guardianLabelActive : styles.guardianLabelInactive,
            ]}
          >
            {isActive ? 'GUARDIAN ACTIVE' : 'TAP TO ACTIVATE'}
          </Text>
          <Text style={styles.guardianSub}>Monitoring your safety</Text>
        </View>
      </TouchableOpacity>

      {/* CARDS */}
      {isActive ? (
        <>
          {/* LOCATION – ACTIVE */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Map')}
          >
            <View style={[styles.card, styles.locationCard]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconCircle,
                    styles.cardIconLocationActive,
                  ]}
                >
                  <Text style={styles.cardIconEmoji}>📍</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>Location Tracking</Text>
                  <Text style={styles.cardStatusActive}>
                    Active &amp; Sharing
                  </Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Coordinates</Text>
                {location ? (
                  <Text style={styles.rowValue}>
                    {location.latitude?.toFixed(4)} ,{' '}
                    {location.longitude?.toFixed(4)}
                  </Text>
                ) : (
                  <Text style={styles.rowValue}>-- , --</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* GESTURE – ACTIVE (TRIPLE-TAP SIMULATION) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleGestureCardPress}
          >
            <View style={[styles.card, styles.gestureCard]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconCircle,
                    styles.cardIconGestureActive,
                  ]}
                >
                  <Text style={styles.cardIconEmoji}>🎯</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>Gesture Detection</Text>
                  <Text style={styles.cardSubActive}>
                    Triple Tap • high sensitivity
                  </Text>
                </View>
              </View>
              <View style={styles.gestureIndicatorOn} />
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* LOCATION – INACTIVE */}
          <View style={[styles.card, styles.locationCard, styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconCircle,
                  styles.cardIconLocationInactive,
                ]}
              >
                <Text style={styles.cardIconEmoji}>📍</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Location Tracking</Text>
                <Text style={styles.cardStatusInactive}>Inactive</Text>
              </View>
            </View>
          </View>

          {/* GESTURE – INACTIVE */}
          <View style={[styles.card, styles.gestureCard, styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconCircle,
                  styles.cardIconGestureInactive,
                ]}
              >
                <Text style={styles.cardIconEmoji}>⬚</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Gesture Detection</Text>
                <Text style={styles.cardSubInactive}>
                  Triple Tap • high sensitivity
                </Text>
              </View>
            </View>
            <View style={styles.gestureIndicatorOff} />
          </View>
        </>
      )}

      {/* BOTTOM ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionTile, styles.actionCall]}
          onPress={handleCall}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionLabel}>Call 112</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, styles.actionAlert]}
          onPress={handleAlertSOS}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <Text style={styles.actionLabel}>Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, styles.actionRoute]}
          onPress={() => navigation.navigate('Route')}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionLabel}>Safe Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, styles.actionContacts]}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionLabel}>Contacts</Text>
        </TouchableOpacity>
      </View>

      {/* SOS BOTTOM SHEET */}
      <Modal
        transparent
        animationType="slide"
        visible={showSOSSheet}
        onRequestClose={() => setShowSOSSheet(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>🚨 SOS Activated</Text>
            <Text style={styles.sheetText}>
              Emergency alert has been sent to your contacts.
            </Text>

            {location && (
              <Text style={styles.locationText}>
                📍 Location shared:{'\n'}
                {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowSOSSheet(false)}
            >
              <Text style={styles.closeText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DashboardScreen;

// styles unchanged ...
const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 40,
  },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    marginLeft: 8,
  },
  iconLabel: { color: '#9ca3af', fontSize: 18 },
  headerIconImg: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#e5e7eb',
  },
  brand: {},
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandLogoImg: { width: 40, height: 40, resizeMode: 'contain' },
  brandTitle: { fontSize: 24, color: '#e5e7eb', fontWeight: '700' },
  brandSubtitle: { marginTop: 2, fontSize: 13, color: '#6b7280' },
  shieldSection: { alignItems: 'center', marginBottom: 50 },
  shieldOuter: {
    width: 220,
    height: 220,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldMiddle: {
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: 'rgba(9, 43, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInner: {
    width: 165,
    height: 165,
    borderRadius: 82.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInnerInactive: {
    backgroundColor: 'rgba(34, 38, 45, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  shieldOuterActive: { backgroundColor: '#10b4cd' },
  shieldInnerActive: { backgroundColor: '#9ca2a8f7' },
  shieldOuterInactive: { backgroundColor: 'rgba(34, 34, 30, 0.69)' },
  shieldImg: { width: 80, height: 80, resizeMode: 'contain', borderRadius: 20 },
  guardianLabel: {
    letterSpacing: 4,
    fontSize: 18,
    textAlign: 'center',
    marginTop: -20,
  },
  guardianLabelInactive: { color: '#9ca3af' },
  guardianLabelActive: { color: '#38bdf8' },
  guardianSub: {
    marginTop: 4,
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#020617',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  locationCard: { marginBottom: 16, marginTop: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconLocationActive: { backgroundColor: 'rgba(22,163,74,0.25)' },
  cardIconGestureActive: { backgroundColor: 'rgba(56,189,248,0.25)' },
  cardIconLocationInactive: { backgroundColor: 'rgba(15,23,42,0.9)' },
  cardIconGestureInactive: { backgroundColor: 'rgba(15,23,42,0.9)' },
  cardIconEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#e5e7eb' },
  cardStatusActive: { fontSize: 12, color: '#22c55e', marginTop: 2 },
  cardStatusInactive: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardSubActive: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  cardSubInactive: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, color: '#e5e7eb' },
  cardInactive: { opacity: 0.72 },
  gestureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  gestureIndicatorOn: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
  },
  gestureIndicatorOff: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4b5563',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionTile: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 20, marginBottom: 4 },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  actionCall: { backgroundColor: '#7f1d1d' },
  actionAlert: { backgroundColor: '#78350f' },
  actionRoute: { backgroundColor: '#0f172a' },
  actionContacts: { backgroundColor: '#1e1b4b' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#111827',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetTitle: {
    color: '#fecaca',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sheetText: { color: '#e5e7eb', marginBottom: 8 },
  locationText: { color: '#a5b4fc', marginTop: 10 },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#b91c1c',
  },
  closeText: { color: '#fee2e2', fontWeight: '600' },
});
