// src/screens/MapScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

const MapScreen = () => {
  const { isActive } = useContext(GuardianContext);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Enable location to see your route.'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const gradientColors = isActive
    ? ['#0F172A', '#1E293B', '#0F172A']
    : ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

  const textColor = isActive ? '#e5e7eb' : COLORS.text;

  if (!location) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingContainer}
      >
        <StatusBar 
          barStyle={isActive ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: textColor }]}>Fetching your location...</Text>
      </LinearGradient>
    );
  }

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
      <Text style={[styles.title, { color: textColor }]}>Your Current Location</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
        />
      </MapView>
    </LinearGradient>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT.subtitle,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
  },
});