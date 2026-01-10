// src/components/GuardianCircle.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING } from '../utils/theme';

const GuardianCircle = ({ active, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.wrapper}>
        <LinearGradient
          colors={
            active
              ? [COLORS.info, COLORS.accent]
              : ['#1e293b', '#020617']
          }
          style={styles.outer}
        >
          <View style={styles.middle}>
            <View style={styles.inner}>
              <Text style={styles.icon}>🛡️</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.status}>
          {active ? 'GUARDIAN ACTIVE' : 'TAP TO ACTIVATE'}
        </Text>
        <Text style={styles.sub}>
          Monitoring your safety
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default GuardianCircle;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: SPACING.xxl,
  },
  outer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 54,
  },
  status: {
    marginTop: SPACING.md,
    color: COLORS.info,
    letterSpacing: 3,
    fontWeight: '600',
  },
  sub: {
    color: COLORS.mutedText,
    fontSize: FONT.caption,
    marginTop: 4,
  },
});
