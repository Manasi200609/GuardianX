import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import SurfaceCard from '../components/SurfaceCard';
import { COLORS, SPACING, FONT } from '../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const [autoShare, setAutoShare] = React.useState(false);
  const [nightMode, setNightMode] = React.useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your safety preferences</Text>

      {/* Profile */}
      <SurfaceCard style={{ marginTop: SPACING.xl }}>
        <Text style={styles.profileName}>Mansi Jadhav</Text>
        <Text style={styles.profileEmail}>jadhavmanasi70@gmail.com</Text>
      </SurfaceCard>

      {/* Safety settings */}
      <Text style={styles.sectionLabel}>Safety Settings</Text>

      <SurfaceCard style={styles.rowCard}>
        <View>
          <Text style={styles.rowTitle}>Auto Share Location</Text>
          <Text style={styles.rowSubtitle}>
            Share location when Guardian Mode is active
          </Text>
        </View>
        <Switch
          value={autoShare}
          onValueChange={setAutoShare}
          thumbColor={autoShare ? COLORS.accent : '#fff'}
        />
      </SurfaceCard>

      <SurfaceCard style={styles.rowCard}>
        <View>
          <Text style={styles.rowTitle}>Auto Night Mode</Text>
          <Text style={styles.rowSubtitle}>
            Auto‑activate between 21:00 – 6:00
          </Text>
        </View>
        <Switch
          value={nightMode}
          onValueChange={setNightMode}
          thumbColor={nightMode ? COLORS.accent : '#fff'}
        />
      </SurfaceCard>

      {/* Quick setup */}
      <Text style={styles.sectionLabel}>Quick Setup</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
        <SurfaceCard style={styles.rowCard}>
          <Text style={styles.rowTitle}>Emergency Contacts</Text>
          <Text style={styles.rowSubtitle}>Manage your safety contacts</Text>
        </SurfaceCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Gesture')}>
        <SurfaceCard style={styles.rowCard}>
          <Text style={styles.rowTitle}>Emergency Gesture</Text>
          <Text style={styles.rowSubtitle}>Configure your safety trigger</Text>
        </SurfaceCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Watch')}>
        <SurfaceCard style={styles.rowCard}>
          <Text style={styles.rowTitle}>Smartwatch</Text>
          <Text style={styles.rowSubtitle}>Pair with your wearable</Text>
        </SurfaceCard>
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.title,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginTop: SPACING.xs,
  },
  profileName: {
    color: COLORS.textPrimary,
    fontSize: FONT.subtitle,
    fontWeight: '600',
  },
  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginTop: SPACING.xs,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.sm,
    fontSize: FONT.caption,
    textTransform: 'uppercase',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  rowTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '500',
  },
  rowSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.caption,
    marginTop: SPACING.xs,
  },
  signOutButton: {
    marginTop: SPACING.xxl,
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  signOutText: {
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default SettingsScreen;
