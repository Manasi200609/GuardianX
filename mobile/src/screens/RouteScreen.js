// src/screens/RouteScreen.js (new version)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { COLORS, SPACING, FONT } from '../utils/theme';

export default function RouteScreen() {
  const [loading, setLoading] = React.useState(false);

  const openGoogleMaps = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Enable location to plan a safe route.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // origin = current location, destination left empty so user can type it
      const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open Google Maps on this device.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open Google Maps.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Safe Route</Text>
      <Text style={styles.subtitle}>
        This will open Google Maps. Enter your destination there and follow the safest route.
      </Text>

      <TouchableOpacity style={styles.button} onPress={openGoogleMaps} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Opening…' : 'Open in Google Maps'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '600',
  },
});
