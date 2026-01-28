import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT } from '../utils/theme';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/guardianx-logo.png.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>GuardianX</Text>
        <Text style={styles.subtitle}>Your Personal Safety Companion</Text>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Protecting you, always on guard</Text>
      </View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    color: '#e5e7eb',
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: FONT.body,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  loaderContainer: {
    marginVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: FONT.caption,
    marginTop: SPACING.md,
    letterSpacing: 1,
  },
  tagline: {
    color: '#475569',
    fontSize: FONT.caption,
    marginTop: SPACING.xl,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});