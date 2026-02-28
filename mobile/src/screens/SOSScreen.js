// src/screens/SOSScreen.js
import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// ─── Trigger metadata ─────────────────────────────────────────────────────
const TRIGGER_META = {
  motion:          { icon: '📳', label: 'VIGOROUS SHAKE DETECTED' },
  triple_tap:      { icon: '⚡', label: 'TRIPLE TAP DETECTED' },
  gesture:         { icon: '✋', label: 'GESTURE DETECTED' },
  manual:          { icon: '⚠️',  label: 'MANUAL SOS TRIGGERED' },
  route_deviation: { icon: '🗺️', label: 'ROUTE DEVIATION DETECTED' },
};

// Core size: ~42% of screen width so it sits nicely with room for everything else
const CORE = Math.round(width * 0.42);

const SOSScreen = ({ route, navigation: navProp }) => {
  const { sendSOS, isActive } = useContext(GuardianContext);
  const navHook = useNavigation();
  const navigation = navProp || navHook;

  const lat         = route?.params?.lat;
  const lng         = route?.params?.lng;
  const triggerType = route?.params?.triggerType || 'manual';
  const autoSent    = route?.params?.autoSent;

  const trigger = TRIGGER_META[triggerType] || TRIGGER_META.manual;

  // ── Hide the React Navigation header (removes the white bar) ──────────
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // ── Animation refs ──────────────────────────────────────────────────────
  const ring1     = useRef(new Animated.Value(0)).current;
  const ring2     = useRef(new Animated.Value(0)).current;
  const ring3     = useRef(new Animated.Value(0)).current;
  const corePulse = useRef(new Animated.Value(0.94)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const slideUp   = useRef(new Animated.Value(28)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Store animation loop refs for cleanup
  const corePulseLoopRef = useRef(null);
  const ring1LoopRef = useRef(null);
  const ring2LoopRef = useRef(null);
  const ring3LoopRef = useRef(null);

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, tension: 85, friction: 11 }),
    ]).start();

    // Shake jolt for motion trigger
    if (triggerType === 'motion') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 9,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,  duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 35, useNativeDriver: true }),
      ]).start();
    }

    // Core breathe
    corePulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, { toValue: 1.06, duration: 950, useNativeDriver: true }),
        Animated.timing(corePulse, { toValue: 0.94, duration: 950, useNativeDriver: true }),
      ])
    );
    corePulseLoopRef.current.start();

    // Staggered radar rings
    const makeRipple = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1900, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0,    useNativeDriver: true }),
        ])
      );

    ring1LoopRef.current = makeRipple(ring1, 0);
    ring2LoopRef.current = makeRipple(ring2, 630);
    ring3LoopRef.current = makeRipple(ring3, 1260);

    ring1LoopRef.current.start();
    ring2LoopRef.current.start();
    ring3LoopRef.current.start();

    // Cleanup on unmount
    return () => {
      if (corePulseLoopRef.current) corePulseLoopRef.current.stop();
      if (ring1LoopRef.current) ring1LoopRef.current.stop();
      if (ring2LoopRef.current) ring2LoopRef.current.stop();
      if (ring3LoopRef.current) ring3LoopRef.current.stop();
    };
  }, [triggerType]);

  useEffect(() => {
    if (autoSent) {
      const t = setTimeout(() => navigation.goBack(), 3500);
      return () => clearTimeout(t);
    }
  }, [autoSent]);

  const handleSendSOS = async () => {
    if (!isActive) return;
    await sendSOS(lat && lng ? { latitude: lat, longitude: lng } : null);
    setTimeout(() => navigation.goBack(), 2000);
  };

  const ringStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.7] }) }],
    opacity:   anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.18, 0] }),
  });

  return (
    <View style={styles.root}>
      {/* Full-bleed dark status bar — no white band */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#060A14"
        translucent={false}
      />

      <LinearGradient
        colors={['#060A14', '#0C1628', '#060A14']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}           // locks scroll unless content overflows
        bounces={false}
      >
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: slideUp }, { translateX: shakeAnim }],
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* ── Status pill ── */}
          <View style={[styles.pill, autoSent ? styles.pillGreen : styles.pillRed]}>
            <View style={[styles.pillDot, autoSent ? styles.dotGreen : styles.dotRed]} />
            <Text style={styles.pillText}>
              {autoSent ? 'ALERT DISPATCHED' : 'EMERGENCY MODE'}
            </Text>
          </View>

          {/* ── Trigger banner ── */}
          <View style={styles.triggerRow}>
            <Text style={styles.triggerIcon}>{trigger.icon}</Text>
            <Text style={styles.triggerLabel}>{trigger.label}</Text>
          </View>

          {/* ── SOS Core + rings ── */}
          <View style={styles.sosWrapper}>
            {[ring1, ring2, ring3].map((r, i) => (
              <Animated.View key={i} style={[styles.ring, ringStyle(r)]} />
            ))}

            {/* Dashed orbit ring */}
            <View style={styles.orbit} />

            {/* Core button */}
            <Animated.View style={[styles.coreShell, { transform: [{ scale: corePulse }] }]}>
              <LinearGradient
                colors={['#FF2020', '#C50000', '#780000']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.coreGrad}
              >
                <View style={styles.coreHighlight} />
                <Text style={styles.sosText}>SOS</Text>
                {autoSent && <Text style={styles.sentTag}>SENT</Text>}
              </LinearGradient>
            </Animated.View>
          </View>

          {/* ── Headline + subline ── */}
          <Text style={styles.headline}>
            {autoSent ? 'Help Is On The Way' : 'Confirm Emergency Alert'}
          </Text>
          <Text style={styles.subline}>
            {autoSent
              ? 'Your live location and SOS alert have been sent to all emergency contacts.'
              : 'This will immediately notify all your emergency contacts with your live GPS location.'}
          </Text>

          {/* ── Location chip ── */}
          {lat && lng ? (
            <View style={styles.locationChip}>
              <View style={styles.locDotWrap}>
                <View style={styles.locDotCore} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locTitle}>Live Location</Text>
                <Text style={styles.locCoords}>
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.livePing} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noLocChip}>
              <Text style={styles.noLocText}>📡  Acquiring GPS location…</Text>
            </View>
          )}

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Buttons ── */}
          {!autoSent && (
            <TouchableOpacity style={styles.sosBtn} onPress={handleSendSOS} activeOpacity={0.82}>
              <LinearGradient
                colors={['#FF2222', '#B80000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sosBtnGrad}
              >
                <Text style={styles.sosBtnText}>SEND EMERGENCY ALERT</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>
              {autoSent ? 'RETURN TO DASHBOARD' : 'CANCEL'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>GuardianX · Emergency Response System</Text>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060A14' },

  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 32,
  },

  // ── Pill ──
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
  },
  pillRed:   { backgroundColor: 'rgba(220,38,38,0.1)',  borderColor: 'rgba(220,38,38,0.45)' },
  pillGreen: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.45)' },
  pillDot:  { width: 7, height: 7, borderRadius: 4 },
  dotRed:   { backgroundColor: '#EF4444' },
  dotGreen: { backgroundColor: '#10B981' },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 2.2, color: '#94A3B8' },

  // ── Trigger row ──
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 20,
  },
  triggerIcon:  { fontSize: 15 },
  triggerLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, color: '#3D5068' },

  // ── SOS circle: sized proportionally, tight margin ──
  sosWrapper: {
    width: CORE * 2.5,
    height: CORE * 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,          // tight — not a huge gap anymore
  },
  ring: {
    position: 'absolute',
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  orbit: {
    position: 'absolute',
    width: CORE + 24,
    height: CORE + 24,
    borderRadius: (CORE + 24) / 2,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    borderStyle: 'dashed',
  },
  coreShell: {
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 22,
  },
  coreGrad: {
    flex: 1,
    borderRadius: CORE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coreHighlight: {
    position: 'absolute',
    top: CORE * 0.08,
    left: CORE * 0.16,
    width: CORE * 0.52,
    height: CORE * 0.25,
    borderRadius: CORE,
    backgroundColor: 'rgba(255,255,255,0.13)',
    transform: [{ rotate: '-14deg' }],
  },
  sosText: {
    fontSize: CORE * 0.3,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 5,
    includeFontPadding: false,
  },
  sentTag: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 4,
    marginTop: -3,
  },

  // ── Copy ──
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  subline: {
    fontSize: 13,
    color: '#4A5E72',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 18,
    paddingHorizontal: 4,
  },

  // ── Location chip ──
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(20,184,166,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.22)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 12,
  },
  locDotWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(20,184,166,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  locDotCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#14B8A6' },
  locTitle:   { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 1.6, marginBottom: 2 },
  locCoords:  { fontSize: 12, fontWeight: '700', color: '#14B8A6' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(20,184,166,0.18)',
    paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, gap: 5,
  },
  livePing: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#14B8A6' },
  liveBadgeText: { fontSize: 9, fontWeight: '800', color: '#14B8A6', letterSpacing: 1.4 },

  noLocChip: {
    width: '100%',
    backgroundColor: 'rgba(100,116,139,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(100,116,139,0.2)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  noLocText: { fontSize: 13, color: '#475569', fontWeight: '600' },

  // ── Divider ──
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(30,41,59,0.9)',
    marginBottom: 16,
  },

  // ── Buttons ──
  sosBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 12,
  },
  sosBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  sosBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2.4 },

  cancelBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(71,85,105,0.3)',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: { fontSize: 12, fontWeight: '700', color: '#3D5068', letterSpacing: 2 },

  footer: { fontSize: 10, color: '#1C2B3A', letterSpacing: 1.2, fontWeight: '600' },
});

export default SOSScreen;