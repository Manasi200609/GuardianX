// src/screens/WatchScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import PrimaryButton from '../components/PrimaryButton';

const WatchScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smartwatch Integration</Text>
      <Text style={styles.subtitle}>
        Pair your wearable to trigger GuardianX with a tap or gesture.
      </Text>

      <View style={styles.card}>
        <Text style={styles.placeholder}>
          This is a placeholder for smartwatch / wearable integration. You can
          demo the UX and talk through the flow.
        </Text>
      </View>

      <PrimaryButton
        title="Back to Dashboard"
        onPress={() => navigation.goBack()}
        style={{ marginTop: SPACING.lg }}
      />
    </View>
  );
};

export default WatchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
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
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    flex: 1,
    borderRadius: 12,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    lineHeight: 20,
  },
});
