// src/screens/MapScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import PrimaryButton from '../components/PrimaryButton';

const MapScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Location</Text>
      <Text style={styles.subtitle}>
        Map integration can be added here (Google Maps / Mapbox).
      </Text>

      <View style={styles.card}>
        <Text style={styles.placeholder}>
          Map placeholder for hackathon demo.
        </Text>
      </View>

      <PrimaryButton
        title="Back to Dashboard"
        onPress={() => navigation.goBack()}
        style={{ marginTop: SPACING.xl }}
      />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
  },
});
