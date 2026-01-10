// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const [autoShareLocation, setAutoShareLocation] = useState(true);
  const [autoNightMode, setAutoNightMode] = useState(false);

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your safety preferences
            </Text>
          </View>
        </View>

        {/* Profile card */}
        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Mansi Jadhav</Text>
            <Text style={styles.profileEmail}>jadhavmanasi70@gmail.com</Text>
          </View>
        </View>

        {/* Safety Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SAFETY SETTINGS</Text>

          <View style={styles.card}>
            {/* Auto share location */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.pill, styles.pillLocation]}>
                  <Text style={styles.pillIcon}>📍</Text>
                </View>
                <View>
                  <Text style={styles.rowTitle}>Auto Share Location</Text>
                  <Text style={styles.rowSub}>
                    Share location when Guardian Mode is active
                  </Text>
                </View>
              </View>
              <Switch
                value={autoShareLocation}
                onValueChange={setAutoShareLocation}
                thumbColor={autoShareLocation ? '#020617' : '#020617'}
                trackColor={{ false: '#374151', true: '#22c55e' }}
              />
            </View>

            <View style={styles.divider} />

            {/* Auto night mode */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.pill, styles.pillNight]}>
                  <Text style={styles.pillIcon}>🌙</Text>
                </View>
                <View>
                  <Text style={styles.rowTitle}>Auto Night Mode</Text>
                  <Text style={styles.rowSub}>
                    Auto‑activate between 21:00 – 6:00
                  </Text>
                </View>
              </View>
              <Switch
                value={autoNightMode}
                onValueChange={setAutoNightMode}
                thumbColor={autoNightMode ? '#020617' : '#020617'}
                trackColor={{ false: '#374151', true: '#22c55e' }}
              />
            </View>
          </View>
        </View>

        {/* Quick Setup */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK SETUP</Text>

          <TouchableOpacity
            style={[styles.card, styles.rowButton]}
            onPress={() => navigation.navigate('Contacts')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.pill, styles.pillContacts]}>
                <Text style={styles.pillIcon}>🔔</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Emergency Contacts</Text>
                <Text style={styles.rowSub}>
                  Manage your safety contacts
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.rowButton]}
            onPress={() => navigation.navigate('Gesture')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.pill, styles.pillGesture]}>
                <Text style={styles.pillIcon}>🛡️</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Emergency Gesture</Text>
                <Text style={styles.rowSub}>
                  Configure your safety trigger
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.rowButton]}
            onPress={() => {}}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.pill, styles.pillWatch]}>
                <Text style={styles.pillIcon}>⌚</Text>
              </View>
              <View>
                <Text style={styles.rowTitle}>Smartwatch</Text>
                <Text style={styles.rowSub}>Not connected</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signoutBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.signoutIcon}>⟲</Text>
          <Text style={styles.signoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          GuardianX Prototype v1.0 • Hackathon Demo
        </Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#020617',
    marginTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  backIcon: {
    color: '#e5e7eb',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 2,
    marginTop: 40,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },

  /* Cards generic */
  card: {
    backgroundColor: '#020617',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },

  /* Profile */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 26,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  profileEmail: {
    fontSize: 12,
    color: '#9ca3af',
  },

  /* Sections */
  section: {
    marginTop: 18,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#6b7280',
    marginBottom: 8,
  },

  /* Rows inside card */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIcon: {
    fontSize: 18,
  },
  pillLocation: {
    backgroundColor: 'rgba(22,163,74,0.18)',
  },
  pillNight: {
    backgroundColor: 'rgba(56,189,248,0.18)',
  },
  pillContacts: {
    backgroundColor: 'rgba(147,51,234,0.22)',
  },
  pillGesture: {
    backgroundColor: 'rgba(56,189,248,0.22)',
  },
  pillWatch: {
    backgroundColor: 'rgba(59,130,246,0.22)',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  rowSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(55,65,81,0.85)',
    marginVertical: 10,
  },

  /* Quick setup row button */
  rowButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    fontSize: 18,
    color: '#6b7280',
  },

  /* Sign out */
  signoutBtn: {
    marginTop: 22,
    borderRadius: 22,
    backgroundColor: '#111827',
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signoutIcon: {
    fontSize: 16,
    color: '#f97373',
  },
  signoutText: {
    fontSize: 14,
    color: '#f97373',
    fontWeight: '600',
  },

  footer: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    color: '#4b5563',
  },
});