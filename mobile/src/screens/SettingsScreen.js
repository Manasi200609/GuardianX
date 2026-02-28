// src/screens/SettingsScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS } from '../utils/theme';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  MoonIcon,
  BellIcon,
  UserCircleIcon,
  UserPlusIcon,
  HandRaisedIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
} from 'react-native-heroicons/outline';

const SettingsScreen = ({ navigation }) => {
  const { isActive } = useContext(GuardianContext);
  const [autoShareLocation, setAutoShareLocation] = useState(true);
  const [autoNightMode, setAutoNightMode] = useState(false);

  const gradientColors = isActive
    ? ['#0F172A', '#1E293B', '#0F172A']
    : ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

  const textColor = isActive ? '#e5e7eb' : '#0F172A';
  const subtextColor = isActive ? '#94a3b8' : '#475569';
  const cardBgColor = isActive ? '#1E293B' : '#FFFFFF';
  const borderColor = isActive ? '#334155' : '#e2e8f0';

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <StatusBar 
        barStyle={isActive ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: cardBgColor, borderColor: borderColor }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftIcon size={20} color={textColor} />
          </TouchableOpacity>

          <View>
            <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
              Customize your safety preferences
            </Text>
          </View>
        </View>

        {/* Profile card */}
        <View style={[styles.card, styles.profileCard, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
          <View style={styles.avatarCircle}>
            <UserCircleIcon size={26} color={isActive ? '#0F172A' : '#0F172A'} />
          </View>
          <View>
            <Text style={[styles.profileName, { color: textColor }]}>Mansi Jadhav</Text>
            <Text style={[styles.profileEmail, { color: subtextColor }]}>jadhavmanasi70@gmail.com</Text>
          </View>
        </View>

        {/* Safety Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: subtextColor }]}>SAFETY SETTINGS</Text>

          <View style={[styles.card, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
            {/* Auto share location */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.pill, styles.pillLocation]}>
                  <MapPinIcon size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: textColor }]}>Auto Share Location</Text>
                  <Text style={[styles.rowSub, { color: subtextColor }]}>
                    Share location when Guardian Mode is active
                  </Text>
                </View>
              </View>
              <Switch
                value={autoShareLocation}
                onValueChange={setAutoShareLocation}
                thumbColor={autoShareLocation ? '#14b8a6' : '#cbd5e1'}
                trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isActive ? '#334155' : '#e2e8f0' }]} />

            {/* Auto night mode */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.pill, styles.pillNight]}>
                  <MoonIcon size={18} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: textColor }]}>Auto Night Mode</Text>
                  <Text style={[styles.rowSub, { color: subtextColor }]}>
                    Auto‑activate between 21:00 – 6:00
                  </Text>
                </View>
              </View>
              <Switch
                value={autoNightMode}
                onValueChange={setAutoNightMode}
                thumbColor={autoNightMode ? '#14b8a6' : '#cbd5e1'}
                trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
              />
            </View>
          </View>
        </View>

        {/* Quick Setup */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: subtextColor }]}>QUICK SETUP</Text>

          <TouchableOpacity
            style={[styles.card, styles.rowButton, { backgroundColor: cardBgColor, borderColor: borderColor }]}
            onPress={() => navigation.navigate('Contacts')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.pill, styles.pillContacts]}>
                <UserPlusIcon size={18} color={COLORS.accent} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: textColor }]}>Emergency Contacts</Text>
                <Text style={[styles.rowSub, { color: subtextColor }]}>
                  Manage your safety contacts</Text>
              </View>
            </View>
            <ChevronRightIcon size={18} color={subtextColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.rowButton, { backgroundColor: cardBgColor, borderColor: borderColor }]}
            onPress={() => navigation.navigate('GestureSelection')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.pill, styles.pillGesture]}>
                <HandRaisedIcon size={18} color={COLORS.secondary} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: textColor }]}>Emergency Gesture</Text>
                <Text style={[styles.rowSub, { color: subtextColor }]}>
                  Configure your safety trigger</Text>
              </View>
            </View>
            <ChevronRightIcon size={18} color={subtextColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.rowButton, { backgroundColor: cardBgColor, borderColor: borderColor }]}
            onPress={() => {}}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.pill, styles.pillWatch]}>
                <DevicePhoneMobileIcon size={18} color={COLORS.accent} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: textColor }]}>Smartwatch</Text>
                <Text style={[styles.rowSub, { color: subtextColor }]}>Not connected</Text>
              </View>
            </View>
            <ChevronRightIcon size={18} color={subtextColor} />
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signoutBtn, { backgroundColor: isActive ? '#991b1b' : '#fee2e2' }]}
          onPress={() => navigation.replace('Login')}
        >
          <ArrowRightOnRectangleIcon size={16} color={isActive ? '#fca5a5' : '#ef4444'} />
          <Text style={[styles.signoutText, { color: isActive ? '#fca5a5' : '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: subtextColor }]}>
          GuardianX Prototype v1.0 • Hackathon Demo
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 32,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginRight: 12,
    borderWidth: 1,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },

  /* Cards generic */
  card: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
  },
  profileEmail: {
    fontSize: 12,
  },

  /* Sections */
  section: {
    marginTop: 18,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
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
    flex: 1,
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
    backgroundColor: 'rgba(22,163,74,0.2)',
  },
  pillNight: {
    backgroundColor: 'rgba(56,189,248,0.2)',
  },
  pillContacts: {
    backgroundColor: 'rgba(147,51,234,0.2)',
  },
  pillGesture: {
    backgroundColor: 'rgba(56,189,248,0.2)',
  },
  pillWatch: {
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
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
  },

  /* Sign out */
  signoutBtn: {
    marginTop: 22,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signoutIcon: {
    fontSize: 16,
  },
  signoutText: {
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 10,
  },
});