// src/components/GuardianToggle.js
import React, { useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

const GuardianToggle = () => {
  const { isActive, toggleGuardian } = useContext(GuardianContext);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Guardian Mode {isActive ? 'ON' : 'OFF'}
      </Text>

      <Switch
        value={isActive}
        onValueChange={toggleGuardian}
        thumbColor={isActive ? COLORS.primary : '#888'}
        trackColor={{ false: '#444', true: COLORS.primary }}
      />
    </View>
  );
};

export default GuardianToggle;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '500',
  },
});
