// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/guardianx-logo.png.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>GuardianX</Text>
      <Text style={styles.subtitle}>Your personal safety companion</Text>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={{ marginTop: SPACING.lg }}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.subtitle,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
