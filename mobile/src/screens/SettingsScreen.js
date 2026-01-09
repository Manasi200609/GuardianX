// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import SurfaceCard from '../components/SurfaceCard';

const SettingsScreen = ({ navigation }) => {
  const [liveTracking, setLiveTracking] = useState(true);
  const [backgroundAlerts, setBackgroundAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleManageContacts = () => {
    navigation.navigate('Contacts');
  };

  const handleGesture = () => {
    navigation.navigate('Gesture');
  };

  const handleAbout = () => {
    Alert.alert('GuardianX', 'Version 1.0.0');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Safety section */}
      <SurfaceCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Safety</Text>

        <View style={styles.row}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>Live tracking</Text>
            <Text style={styles.rowSubtitle}>
              Use GPS to update your location in real time
            </Text>
          </View>
          <Switch
            value={liveTracking}
            onValueChange={setLiveTracking}
            thumbColor={liveTracking ? COLORS.accent : '#111827'}
            trackColor={{ false: '#4B5563', true: '#22C55E' }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>Background alerts</Text>
            <Text style={styles.rowSubtitle}>
              Allow GuardianX to send alerts when the app is closed
            </Text>
          </View>
          <Switch
            value={backgroundAlerts}
            onValueChange={setBackgroundAlerts}
            thumbColor={backgroundAlerts ? COLORS.accent : '#111827'}
            trackColor={{ false: '#4B5563', true: '#22C55E' }}
          />
        </View>
      </SurfaceCard>

      {/* Personalization section */}
      <SurfaceCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personalization</Text>

        <TouchableOpacity style={styles.row} onPress={handleManageContacts}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>Emergency contacts</Text>
            <Text style={styles.rowSubtitle}>Manage who gets your alerts</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleGesture}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>Gesture</Text>
            <Text style={styles.rowSubtitle}>Customize the trigger gesture</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>Sound alerts</Text>
            <Text style={styles.rowSubtitle}>
              Play a loud sound when sending an alert
            </Text>
          </View>
          <Switch
            value={soundAlerts}
            onValueChange={setSoundAlerts}
            thumbColor={soundAlerts ? COLORS.accent : '#111827'}
            trackColor={{ false: '#4B5563', true: '#22C55E' }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>Dark mode</Text>
            <Text style={styles.rowSubtitle}>
              Use the dark GuardianX theme
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            thumbColor={darkMode ? COLORS.accent : '#111827'}
            trackColor={{ false: '#4B5563', true: '#22C55E' }}
          />
        </View>
      </SurfaceCard>

      {/* About section */}
      <SurfaceCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.row} onPress={handleAbout}>
          <View style={styles.rowTextBlock}>
            <Text style={styles.rowTitle}>About GuardianX</Text>
            <Text style={styles.rowSubtitle}>Version, terms & privacy</Text>
          </View>
        </TouchableOpacity>
      </SurfaceCard>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerRow: {
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.title,
    fontWeight: '700',
  },

  sectionCard: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.caption,
    marginBottom: SPACING.sm,
    letterSpacing: 1.5,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  rowTextBlock: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  rowTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.caption,
    marginTop: 2,
  },
});
