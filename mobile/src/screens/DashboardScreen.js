import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import { GuardianContext } from '../context/GuardianContext';

const { width, height } = Dimensions.get('window');

// ─── Shake Detection Config ────────────────────────────────────────────────
const SHAKE_THRESHOLD    = 2.2;
const SHAKE_COUNT_TRIGGER = 5;
const SHAKE_WINDOW_MS    = 1200;
const SHAKE_COOLDOWN_MS  = 4000;

// ─── Triple Tap Config ────────────────────────────────────────────────────
const TRIPLE_TAP_WINDOW_MS = 600;

// ─── Proportional shield sizing ───────────────────────────────────────────
// Shield outer circle = 44% of screen width — looks good on all phones
const SHIELD_SIZE  = Math.round(width * 0.44);
const SHIELD_INNER = Math.round(SHIELD_SIZE * 0.78);
const IMG_SIZE     = Math.round(SHIELD_SIZE * 0.42);

const DashboardScreen = ({ route }) => {
  const navigation = useNavigation();
  const { isActive, toggleGuardian, setSosScreenNavigation } = useContext(GuardianContext);
  const [location, setLocation] = useState(null);
  const user = route?.params?.user || null;

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const lastAccel        = useRef({ x: 0, y: 0, z: 0 });
  const shakeTimestamps  = useRef([]);
  const lastShakeTrigger = useRef(0);
  const accelSubscription = useRef(null);
  const tapTimestamps    = useRef([]);

  // ── Hide nav header ──────────────────────────────────────────────────────
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    if (setSosScreenNavigation) setSosScreenNavigation(navigation);
  }, []);

  useEffect(() => {
    if (isActive) {
      startLocationTracking();
      startShakeDetection();
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
      stopShakeDetection();
    }
    return () => stopShakeDetection();
  }, [isActive]);

  // ── Location ──────────────────────────────────────────────────────────────
  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    }
  };

  // ── Shake Detection ───────────────────────────────────────────────────────
  const startShakeDetection = () => {
    Accelerometer.setUpdateInterval(50);
    accelSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const prev = lastAccel.current;
      const dx = Math.abs(x - prev.x);
      const dy = Math.abs(y - prev.y);
      const dz = Math.abs(z - prev.z);
      lastAccel.current = { x, y, z };

      if (dx > SHAKE_THRESHOLD || dy > SHAKE_THRESHOLD || dz > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTrigger.current < SHAKE_COOLDOWN_MS) return;
        shakeTimestamps.current.push(now);
        shakeTimestamps.current = shakeTimestamps.current.filter(t => now - t < SHAKE_WINDOW_MS);
        if (shakeTimestamps.current.length >= SHAKE_COUNT_TRIGGER) {
          lastShakeTrigger.current = now;
          shakeTimestamps.current  = [];
          handleSOSTrigger('motion');
        }
      }
    });
  };

  const stopShakeDetection = () => {
    if (accelSubscription.current) {
      accelSubscription.current.remove();
      accelSubscription.current = null;
    }
  };

  // ── Triple Tap Detection ──────────────────────────────────────────────────
  const handleScreenTap = useCallback(() => {
    const now = Date.now();
    tapTimestamps.current.push(now);
    tapTimestamps.current = tapTimestamps.current.filter(t => now - t < TRIPLE_TAP_WINDOW_MS);
    if (tapTimestamps.current.length >= 3) {
      tapTimestamps.current = [];
      handleSOSTrigger('triple_tap');
    }
  }, []);

  // ── SOS Trigger ───────────────────────────────────────────────────────────
  const handleSOSTrigger = useCallback(
    (triggerType = 'manual') => {
      navigation.navigate('SOS', {
        triggerType,
        lat: location?.latitude  ?? null,
        lng: location?.longitude ?? null,
      });
    },
    [navigation, location]
  );

  // ── Safe Route handler ────────────────────────────────────────────────────
  // Opens Google Maps directions with the user's current location pre-filled
  // as the origin. The destination field is left blank so the user can type it.
  const handleSafeRoute = useCallback(() => {
    if (!location) {
      Alert.alert('Safe Route', 'Still acquiring your location… try again in a moment.');
      return;
    }

    const { latitude, longitude } = location;

    // Try the native Google Maps app first (deeplink), fall back to browser URL
    const nativeUrl  = `comgooglemaps://?saddr=${latitude},${longitude}&directionsmode=walking`;
    const browserUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&travelmode=walking`;

    Linking.canOpenURL(nativeUrl)
      .then((supported) => {
        const url = supported ? nativeUrl : browserUrl;
        return Linking.openURL(url);
      })
      .catch(() => {
        // canOpenURL can throw on Android if the scheme isn't registered —
        // fall straight through to the browser URL
        Linking.openURL(browserUrl).catch(() =>
          Alert.alert('Safe Route', 'Could not open Google Maps. Please make sure it is installed.')
        );
      });
  }, [location]);

  // ── Contacts handler ──────────────────────────────────────────────────────
  // Navigates to the emergency contacts screen; falls back to a placeholder.
  const handleContacts = useCallback(() => {
    const routes = navigation.getState()?.routeNames ?? [];
    if (routes.includes('EmergencyContacts')) {
      navigation.navigate('EmergencyContacts');
    } else if (routes.includes('Contacts')) {
      navigation.navigate('Contacts');
    } else {
      // Soft placeholder until the screen is built
      Alert.alert(
        'Emergency Contacts',
        'Manage the contacts who receive your SOS alerts.\n\n(Connect to your EmergencyContacts screen to enable this.)',
        [{ text: 'OK' }]
      );
    }
  }, [navigation]);

  // ─── Theme ─────────────────────────────────────────────────────────────
  const isDark       = isActive;
  const bgColors     = isDark ? ['#020617', '#0F172A', '#020617'] : ['#F8FAFC', '#F1F5F9', '#E2E8F0'];
  const surfaceColor = isDark ? 'rgba(30,41,59,0.7)' : '#FFFFFF';
  const borderColor  = isDark ? 'rgba(56,189,248,0.15)' : 'rgba(148,163,184,0.2)';
  const mainText     = isDark ? '#F8FAFC' : '#1E293B';
  const subText      = isDark ? '#94A3B8' : '#64748B';
  const accentColor  = '#14B8A6';

  const quickActions = [
    {
      label: 'Call 112',
      symbol: '✆',
      symbolSize: 26,
      action: () => {
        Linking.openURL('tel:112').catch(() =>
          Alert.alert('Emergency', 'Could not dial 112.')
        );
      },
    },
    {
      label: 'SOS Alert',
      symbol: 'SOS',
      symbolSize: 15,
      isSOS: true,
      action: () => handleSOSTrigger('manual'),
    },
    {
      label: 'Safe Route',
      symbol: '◎',
      symbolSize: 26,
      action: handleSafeRoute,
    },
    {
      label: 'Contacts',
      symbol: '⊕',
      symbolSize: 26,
      action: handleContacts,
    },
  ];

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleScreenTap} style={{ flex: 1 }}>
      <LinearGradient colors={bgColors} style={styles.app}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#020617' : '#F8FAFC'}
          translucent={false}
        />

        {/* BACKGROUND */}
        {isDark ? (
          <Image source={require('../../assets/map.jpg')} style={styles.mapBackground} />
        ) : (
          <View style={styles.bgContainer}>
            <View style={styles.watermarkContainer}>
              <Image source={require('../../assets/s1.png')} style={styles.shieldWatermark} />
            </View>
          </View>
        )}

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.brandTitle, { color: mainText }]}>
                GUARDIAN<Text style={{ color: accentColor }}>X</Text>
              </Text>
              <Text style={[styles.brandSubtitle, { color: subText }]}>
                SYSTEM STATUS: {isActive ? 'ARMED' : 'STANDBY'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.menuBtn, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image
                source={require('../../assets/menu.png')}
                style={[styles.menuIcon, { tintColor: mainText }]}
              />
            </TouchableOpacity>
          </View>

          {/* ── SHIELD ── */}
          <View style={styles.shieldWrapper}>
            <TouchableOpacity
              onPress={() => {
                toggleGuardian();
                if (!isActive) setTimeout(() => navigation.navigate('GuardianMode'), 400);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.shieldCore}>
                {isActive && (
                  <>
                    <Animated.View
                      style={[
                        styles.pulse,
                        {
                          transform: [{
                            scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.75] }),
                          }],
                          opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
                        },
                      ]}
                    />
                    <View style={[styles.staticGlowRing, { borderColor: 'rgba(20,184,166,0.2)' }]} />
                  </>
                )}
                <View
                  style={[
                    styles.shieldOuter,
                    {
                      borderColor:     isActive ? '#14B8A6' : '#CBD5E1',
                      backgroundColor: isActive ? '#020617' : surfaceColor,
                      borderWidth:     isActive ? 3 : 1.5,
                      elevation:       isActive ? 14 : 4,
                      width:  SHIELD_SIZE,
                      height: SHIELD_SIZE,
                      borderRadius: SHIELD_SIZE / 2,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.innerBezel,
                      {
                        backgroundColor: isActive ? 'rgba(20,184,166,0.05)' : 'transparent',
                        width:  SHIELD_INNER,
                        height: SHIELD_INNER,
                        borderRadius: SHIELD_INNER / 2,
                      },
                    ]}
                  >
                    <Image
                      source={isActive ? require('../../assets/s2.png') : require('../../assets/s1.png')}
                      style={[
                        styles.shieldImg,
                        { width: IMG_SIZE, height: IMG_SIZE },
                        !isActive && { tintColor: '#94A3B8', opacity: 0.6 },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={[styles.statusText, { color: isActive ? '#14B8A6' : subText }]}>
              {isActive ? 'SHIELD ACTIVE' : 'SYSTEM DISARMED'}
            </Text>
            <Text style={[styles.hint, { color: isDark ? '#1E3A4A' : '#C8D5E0' }]}>
              Triple-tap anywhere · Shake to trigger SOS
            </Text>
          </View>

          {/* ── CARDS ── */}
          <View style={styles.cardContainer}>
            <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: isActive ? 'rgba(20,184,166,0.1)' : '#F1F5F9' }]}>
                  <Text style={styles.emojiIcon}>{isActive ? '✋' : '⬚'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: mainText }]}>Hand Gesture Engine</Text>
                  <Text style={[styles.cardSub, { color: subText }]}>
                    {isActive ? 'MediaPipe: Tracking Active' : 'Gesture Logic: Paused'}
                  </Text>
                </View>
                {isActive && <View style={styles.liveIndicator} />}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Map')}
              style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: isActive ? 'rgba(56,189,248,0.1)' : '#F1F5F9' }]}>
                  <Text style={styles.emojiIcon}>📍</Text>
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: mainText }]}>Digital Shadow</Text>
                  <Text style={[styles.cardSub, { color: subText }]}>
                    {location
                      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : 'GPS Standby'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── QUICK ACTIONS ── */}
          <View style={styles.actionGrid}>
            {quickActions.map((item, i) => {
              // SOS button: red only when guardian is active, neutral otherwise
              const sosActive = item.isSOS && isActive;
              const btnBg = item.isSOS
                ? (isActive
                    ? isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.1)'
                    : surfaceColor)
                : surfaceColor;
              const btnBorder = item.isSOS
                ? (isActive ? 'rgba(239,68,68,0.45)' : borderColor)
                : borderColor;
              const iconColor = item.isSOS
                ? (isActive ? '#EF4444' : subText)
                : accentColor;
              const labelColor = item.isSOS
                ? (isActive ? '#EF4444' : mainText)
                : mainText;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={item.action}
                  activeOpacity={0.75}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: btnBg, borderColor: btnBorder },
                  ]}
                >
                  {/* Icon circle */}
                  <View style={[
                    styles.actionIconCircle,
                    { backgroundColor: item.isSOS
                        ? (isActive ? 'rgba(239,68,68,0.12)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'))
                        : (isDark ? 'rgba(20,184,166,0.1)' : '#F0FAFA'),
                    },
                  ]}>
                    <Text style={[styles.actionSymbol, { color: iconColor, fontSize: item.symbolSize }]}>
                      {item.symbol}
                    </Text>
                  </View>
                  <Text style={[styles.actionLabel, { color: labelColor }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  app: { flex: 1 },

  mainContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 28,                   // breathing room at the bottom
    justifyContent: 'space-between',     // distributes sections evenly
  },

  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    width, height,
    opacity: 0.15,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldWatermark: {
    width: width * 0.65,
    height: width * 0.65,
    opacity: 0.04,
    tintColor: '#64748B',
    resizeMode: 'contain',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // no fixed marginBottom — handled by space-between on parent
  },
  brandTitle:    { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  brandSubtitle: { fontSize: 9,  fontWeight: '700', letterSpacing: 1, marginTop: 3 },
  menuBtn: {
    width: 44, height: 44, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  menuIcon: { width: 20, height: 20 },

  // ── Shield ──
  shieldWrapper: { alignItems: 'center' },
  shieldCore: {
    width:  Math.round(width * 0.44) + 40,
    height: Math.round(width * 0.44) + 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width:  Math.round(width * 0.44),
    height: Math.round(width * 0.44),
    borderRadius: Math.round(width * 0.22),
    backgroundColor: '#14B8A6',
  },
  staticGlowRing: {
    position: 'absolute',
    width:  Math.round(width * 0.44) + 12,
    height: Math.round(width * 0.44) + 12,
    borderRadius: Math.round(width * 0.22) + 6,
    borderWidth: 1,
  },
  shieldOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  innerBezel: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  shieldImg: { resizeMode: 'contain' },
  statusText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  hint: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // ── Cards ──
  cardContainer: { gap: 10 },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow:  { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 42, height: 42, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  emojiIcon: { fontSize: 18 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSub:   { fontSize: 10, marginTop: 2, fontWeight: '500' },
  liveIndicator: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },

  // ── Action grid ──
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    width: (width - 54) / 2,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionSymbol: { fontWeight: '700', textAlign: 'center' },
  actionLabel:  { fontSize: 11, fontWeight: '700' },
});

export default DashboardScreen;