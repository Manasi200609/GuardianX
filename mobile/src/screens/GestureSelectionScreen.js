import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, FONT } from '../utils/theme';

const GestureSelectionScreen = ({ navigation }) => {
  const { gesturePreferences, toggleGesturePreference, isActive } = useContext(GuardianContext);

  const handleSelect = (gesture) => {
    toggleGesturePreference(gesture);
    navigation.navigate('GestureCamera', { gesture });
  };

  const gradientColors = isActive
    ? ['#0F172A', '#1E293B', '#0F172A']
    : ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

  const textColor = isActive ? '#e5e7eb' : COLORS.text;
  const subtextColor = isActive ? '#94a3b8' : COLORS.textSecondary;
  const cardBgColor = isActive ? '#1E293B' : '#FFFFFF';
  const borderColor = isActive ? '#334155' : '#e2e8f0';

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar 
        barStyle={isActive ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: textColor }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Choose Your SOS Gesture</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            Select which hand gesture triggers emergency SOS
          </Text>
        </View>

        {/* Gesture 1: Waving */}
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
          <View style={styles.cardContent}>
            <View style={styles.gestureIcon}>
              <Text style={styles.gestureEmoji}>👋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Rigorous Waving</Text>
              <Text style={[styles.sub, { color: subtextColor }]}>
                Raise and wave your hand rapidly
              </Text>
            </View>
            <Switch
              value={gesturePreferences.waving}
              onValueChange={() => handleSelect('waving')}
              thumbColor={gesturePreferences.waving ? COLORS.primary : '#cbd5e1'}
              trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
            />
          </View>
        </View>

        {/* Gesture 2: Closed Fist */}
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
          <View style={styles.cardContent}>
            <View style={styles.gestureIcon}>
              <Text style={styles.gestureEmoji}>✊</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Closed Fist</Text>
              <Text style={[styles.sub, { color: subtextColor }]}>
                Hold a tight fist in front of camera for 3 seconds
              </Text>
            </View>
            <Switch
              value={gesturePreferences.fist}
              onValueChange={() => handleSelect('fist')}
              thumbColor={gesturePreferences.fist ? COLORS.primary : '#cbd5e1'}
              trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
            />
          </View>
        </View>

        {/* Gesture 3: Open Palm */}
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
          <View style={styles.cardContent}>
            <View style={styles.gestureIcon}>
              <Text style={styles.gestureEmoji}>🖐️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Open Palm</Text>
              <Text style={[styles.sub, { color: subtextColor }]}>
                Show a clear open palm to the camera
              </Text>
            </View>
            <Switch
              value={gesturePreferences.open_palm}
              onValueChange={() => handleSelect('open_palm')}
              thumbColor={gesturePreferences.open_palm ? COLORS.primary : '#cbd5e1'}
              trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: isActive ? '#1e7e34' : '#dcfce7', borderColor }]}>
          <Text style={[styles.infoTitle, { color: isActive ? '#a7f3d0' : '#166534' }]}>
            💡 Tip
          </Text>
          <Text style={[styles.infoText, { color: isActive ? '#d1fae5' : '#166534' }]}>
            Choose a gesture you can easily perform in an emergency. Enable Guardian Mode to start detection.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  backBtn: {
    fontSize: FONT.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.body,
  },
  card: {
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gestureIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureEmoji: {
    fontSize: 28,
  },
  label: {
    fontSize: FONT.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sub: {
    fontSize: FONT.caption,
  },
  infoBox: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT.body,
    lineHeight: 22,
  },
});

export default GestureSelectionScreen;