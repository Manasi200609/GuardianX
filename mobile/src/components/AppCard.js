import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

const AppCard = ({ children, style, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper activeOpacity={0.9} onPress={onPress} style={[styles.card, style]}>
      {children}
    </Wrapper>
  );
};

export default AppCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.large,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
