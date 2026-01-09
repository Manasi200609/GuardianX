import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

const SurfaceCard = ({ children, variant = 'default', style }) => {
  const bg =
    variant === 'highlight' ? COLORS.primarySoft : COLORS.surface;

  return (
    <View style={[styles.card, { backgroundColor: bg }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default SurfaceCard;
