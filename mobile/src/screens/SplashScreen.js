// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT } from '../utils/theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // ── Hide header (removes white nav bar) ──────────────────────────────
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // ── Animations ────────────────────────────────────────────────────────
  const logoScale  = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse  = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fades in after logo
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Loader fades in last
    Animated.timing(loaderOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Glow breathe loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Navigate after 2.6s
    const timer = setTimeout(() => navigation.replace('Login'), 2600);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.root}>
      {/* Full-bleed dark status bar — eliminates the white band */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#060A14"
        translucent={false}
      />

      <LinearGradient
        colors={['#060A14', '#0D1526', '#060A14']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle radial glow behind logo */}
      <Animated.View
        style={[styles.radialGlow, { opacity: glowPulse }]}
        pointerEvents="none"
      />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoRing,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          {/* Outer decorative ring */}
          <View style={styles.logoRingOuter} />

          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/guardianx-logo.png.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title block */}
        <Animated.View style={[styles.titleBlock, { opacity: textOpacity }]}>
          <Text style={styles.title}>
            GUARDIAN<Text style={styles.titleAccent}>X</Text>
          </Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Personal Safety Companion</Text>
        </Animated.View>

        {/* Loader */}
        <Animated.View style={[styles.loaderRow, { opacity: loaderOpacity }]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <LoaderDot key={i} delay={i * 120} />
          ))}
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
          Protecting you, always on guard
        </Animated.Text>
      </View>
    </View>
  );
};

// Animated bouncing dot for the loader
const LoaderDot = ({ delay }) => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0,  duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: bounce }] }]}
    />
  );
};

const LOGO = width * 0.3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060A14' },

  radialGlow: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: '#14B8A6',
    top: '20%',
    left: '-10%',
    opacity: 0.04,
    // Not a true radial gradient but creates ambient glow on Android
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },

  // Logo
  logoRing: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  logoRingOuter: {
    position: 'absolute',
    width: LOGO + 32,
    height: LOGO + 32,
    borderRadius: (LOGO + 32) / 2,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.2)',
    borderStyle: 'dashed',
  },
  logoCircle: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: '#0C1E36',
    borderWidth: 2,
    borderColor: 'rgba(20,184,166,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  logo: {
    width: LOGO * 0.85,
    height: LOGO * 0.85,
    borderRadius: LOGO / 2,
  },

  // Title
  titleBlock: { alignItems: 'center', marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 3,
    marginBottom: 8,
  },
  titleAccent: { color: '#14B8A6' },
  titleUnderline: {
    width: 40,
    height: 2,
    backgroundColor: '#14B8A6',
    borderRadius: 1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Dot loader
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 36,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    opacity: 0.7,
  },

  // Tagline
  tagline: {
    fontSize: 11,
    color: '#2D3F52',
    fontStyle: 'italic',
    letterSpacing: 0.8,
    fontWeight: '500',
  },
});

export default SplashScreen;