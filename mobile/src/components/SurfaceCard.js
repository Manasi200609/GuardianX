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
   backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
});

export default SurfaceCard;
