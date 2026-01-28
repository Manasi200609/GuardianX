// src/screens/RouteScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

export default function RouteScreen() {
  const { isActive } = useContext(GuardianContext);
  const [loading, setLoading] = React.useState(false);

  const gradientColors = isActive
    ? ['#0F172A', '#1E293B', '#0F172A']
    : ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

  const textColor = isActive ? '#e5e7eb' : COLORS.text;
  const subtextColor = isActive ? '#94a3b8' : COLORS.textSecondary;
  const buttonBgColor = isActive ? COLORS.primary : COLORS.primary;

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
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar 
        barStyle={isActive ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Plan Safe Route</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          This will open Google Maps. Enter your destination there and follow the safest route.
        </Text>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: buttonBgColor }]} 
          onPress={openGoogleMaps} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Opening…' : '🗺️ Open in Google Maps'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    paddingTop: SPACING.xl + 20,
  },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT.body,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  button: {
    borderRadius: 16,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT.body,
    fontWeight: '600',
  },
});