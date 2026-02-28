// src/screens/GestureSelectionScreen.js
import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

const GESTURES = [
  {
    key: 'waving',
    title: 'Rigorous Waving',
    description: 'Raise and wave your hand rapidly in front of the camera',
    symbol: '〜',
    symbolSize: 28,
  },
  {
    key: 'fist',
    title: 'Closed Fist',
    description: 'Hold a tight fist in front of the camera for 3 seconds',
    symbol: '◆',
    symbolSize: 22,
  },
  {
    key: 'open_palm',
    title: 'Open Palm',
    description: 'Show a clear, flat open palm facing the camera',
    symbol: '▣',
    symbolSize: 22,
  },
];

// ─── Gesture card ─────────────────────────────────────────────────────────
// KEY FIX: Split into two Animated.Views so that:
//   - outer: borderColor driven by JS (useNativeDriver: false)
//   - inner: scale/transform driven by native (useNativeDriver: true)
// A single Animated.View CANNOT have both JS and native animated props.
const GestureCard = ({
  gesture, isSelected, isDark,
  textColor, subtextColor, cardBg, staticBorderColor, onToggle,
}) => {
  // JS-only node — drives borderColor (layout prop, cannot use native driver)
  const glowAnim  = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  // Native-only node — drives transform: scale (can use native driver)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Each node animated independently with its own driver — no mixing
    if (isSelected) {
      Animated.timing(glowAnim, {
        toValue: 1, duration: 280, useNativeDriver: false,
      }).start();
      Animated.spring(scaleAnim, {
        toValue: 1.02, tension: 140, friction: 8, useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0, duration: 180, useNativeDriver: false,
      }).start();
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 140, friction: 8, useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  const animatedBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [staticBorderColor, 'rgba(20,184,166,0.65)'],
  });

  const animatedBg = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      cardBg,
      isDark ? 'rgba(20,184,166,0.07)' : 'rgba(20,184,166,0.04)',
    ],
  });

  return (
    // OUTER: JS-driven — borderColor + backgroundColor only, NO transform
    <Animated.View
      style={[
        styles.cardOuter,
        {
          borderColor:     animatedBorderColor,  // JS ✓
          backgroundColor: animatedBg,           // JS ✓
        },
      ]}
    >
      {/* INNER: native-driven — transform scale only, NO layout/color props */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.cardContent}>
          <View style={[
            styles.iconBox,
            {
              backgroundColor: isSelected
                ? 'rgba(20,184,166,0.18)'
                : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
            },
          ]}>
            <Text style={[
              styles.iconSymbol,
              {
                color: isSelected ? '#14B8A6' : (isDark ? '#475569' : '#94A3B8'),
                fontSize: gesture.symbolSize,
              },
            ]}>
              {gesture.symbol}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: textColor }]}>{gesture.title}</Text>
            <Text style={[styles.cardSub, { color: subtextColor }]}>{gesture.description}</Text>
          </View>

          <Switch
            value={isSelected}
            onValueChange={onToggle}
            thumbColor={isSelected ? '#14B8A6' : (isDark ? '#475569' : '#CBD5E1')}
            trackColor={{ false: isDark ? '#1E293B' : '#E2E8F0', true: 'rgba(20,184,166,0.35)' }}
          />
        </View>

        {isSelected && <View style={styles.selectedBar} />}
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────
const GestureSelectionScreen = ({ navigation }) => {
  const { gesturePreferences, toggleGesturePreference, isActive } = useContext(GuardianContext);

  // Both native-only — opacity and translateY are safe with useNativeDriver: true
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    // Both use true — safe to use parallel
    const entrance = Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, []);

  const isDark       = isActive;
  const gradientColors = isDark
    ? ['#060A14', '#0D1526', '#060A14']
    : ['#F8FAFC', '#EEF2F7', '#F1F5F9'];
  const textColor        = isDark ? '#E2E8F0' : '#1E293B';
  const subtextColor     = isDark ? '#64748B' : '#94A3B8';
  const cardBg           = isDark ? '#0F1923' : '#FFFFFF';
  const staticBorderColor = isDark ? '#1E293B' : '#E8EDF4';

  const selectedCount = GESTURES.filter(g => gesturePreferences[g.key]).length;

  const handleToggle = (gestureKey, currentValue) => {
    if (!currentValue) {
      toggleGesturePreference(gestureKey);
      navigation.navigate('GestureCamera', { gesture: gestureKey });
    } else {
      toggleGesturePreference(gestureKey);
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#060A14' : '#F8FAFC'}
        translucent={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* opacity + translateY — both native-safe */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
            <Text style={[styles.backArrow, { color: isDark ? '#475569' : '#94A3B8' }]}>←</Text>
            <Text style={[styles.backLabel,  { color: isDark ? '#475569' : '#94A3B8' }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerBlock}>
            <Text style={[styles.heading,    { color: textColor }]}>SOS Gesture</Text>
            <Text style={[styles.subheading, { color: subtextColor }]}>
              Select a hand gesture that silently triggers an emergency alert
            </Text>
          </View>

          {/* Empty state */}
          {selectedCount === 0 && (
            <View style={[styles.emptyBanner, {
              borderColor:     isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)',
              backgroundColor: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)',
            }]}>
              <View style={styles.emptyBannerDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyBannerTitle}>No gesture selected</Text>
                <Text style={styles.emptyBannerSub}>
                  Enable at least one gesture below to activate hand-based SOS detection
                </Text>
              </View>
            </View>
          )}

          {/* Active banner */}
          {selectedCount > 0 && (
            <View style={[styles.activeBanner, {
              borderColor:     'rgba(20,184,166,0.3)',
              backgroundColor: isDark ? 'rgba(20,184,166,0.06)' : 'rgba(20,184,166,0.04)',
            }]}>
              <View style={styles.activeBannerDot} />
              <Text style={styles.activeBannerText}>
                {selectedCount} gesture{selectedCount > 1 ? 's' : ''} active — camera will open to calibrate
              </Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: isDark ? '#334155' : '#CBD5E1' }]}>
            AVAILABLE GESTURES
          </Text>

          {GESTURES.map((gesture) => (
            <GestureCard
              key={gesture.key}
              gesture={gesture}
              isSelected={!!gesturePreferences[gesture.key]}
              isDark={isDark}
              textColor={textColor}
              subtextColor={subtextColor}
              cardBg={cardBg}
              staticBorderColor={staticBorderColor}
              onToggle={() => handleToggle(gesture.key, !!gesturePreferences[gesture.key])}
            />
          ))}

          <View style={[styles.infoBox, {
            backgroundColor: isDark ? '#0D1A2A' : '#F0FAFA',
            borderColor:     isDark ? 'rgba(20,184,166,0.2)' : 'rgba(20,184,166,0.3)',
          }]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>◈</Text>
              <Text style={[styles.infoTitle, { color: isDark ? '#14B8A6' : '#0D9488' }]}>How it works</Text>
            </View>
            <Text style={[styles.infoText, { color: subtextColor }]}>
              When Guardian Mode is active, showing your selected gesture to the camera
              will automatically dispatch an SOS alert with your live location.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default GestureSelectionScreen;

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 54, paddingBottom: 40 },

  backRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  backArrow: { fontSize: 20, fontWeight: '300' },
  backLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },

  headerBlock: { marginBottom: 20 },
  heading:     { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  subheading:  { fontSize: 13, lineHeight: 20, fontWeight: '500' },

  emptyBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20,
  },
  emptyBannerDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginTop: 4 },
  emptyBannerTitle: { fontSize: 13, fontWeight: '700', color: '#EF4444', marginBottom: 3 },
  emptyBannerSub:   { fontSize: 12, color: '#EF4444', opacity: 0.75, lineHeight: 18 },

  activeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20,
  },
  activeBannerDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#14B8A6' },
  activeBannerText: { fontSize: 12, fontWeight: '600', color: '#14B8A6', flex: 1 },

  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, marginBottom: 12 },

  // Card — outer is JS-animated (no transform), inner is native-animated (no color)
  cardOuter: {
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  iconSymbol: { fontWeight: '700', textAlign: 'center' },
  cardTitle:  { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  cardSub:    { fontSize: 11, lineHeight: 16, fontWeight: '500' },
  selectedBar: {
    height: 3, backgroundColor: '#14B8A6',
    marginHorizontal: 16, marginBottom: 12, borderRadius: 2, opacity: 0.7,
  },

  infoBox: {
    borderRadius: 16, borderWidth: 1,
    borderLeftWidth: 3, borderLeftColor: '#14B8A6', padding: 16, marginTop: 8,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoIcon:  { fontSize: 16, color: '#14B8A6' },
  infoTitle: { fontSize: 13, fontWeight: '700' },
  infoText:  { fontSize: 12, lineHeight: 19, fontWeight: '500' },
});