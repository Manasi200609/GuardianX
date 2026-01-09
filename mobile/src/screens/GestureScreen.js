// src/screens/GestureScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { COLORS, SPACING, FONT } from '../utils/theme';
import PrimaryButton from '../components/PrimaryButton';
import { saveGesture } from '../services/api';
import { GuardianContext } from '../context/GuardianContext';

const GestureScreen = ({ navigation }) => {
  // Prototype-safe user
  const user = { _id: 'demo-user-id' };

  const { isActive, sendSOS } = useContext(GuardianContext);

  const [gestureName, setGestureName] = useState('');
  const [description, setDescription] = useState('');
  const [showDetector, setShowDetector] = useState(false);

  /* ========== SAVE GESTURE CONFIG ========== */
  const handleSave = async () => {
    if (!gestureName.trim()) {
      Alert.alert('Missing name', 'Please enter a gesture name.');
      return;
    }

    try {
      await saveGesture({
        userId: user._id,
        gesturePattern: gestureName,
        description,
      });

      Alert.alert('Gesture Saved', 'Gesture configuration stored.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save gesture.');
      console.log(error.message);
    }
  };

  /* ========== MEDIA PIPE CALLBACK ========== */
  const handleGestureDetected = () => {
    setShowDetector(false);

    if (!isActive) {
      Alert.alert(
        'Guardian Mode OFF',
        'Turn ON Guardian Mode to activate emergency gestures.'
      );
      return;
    }

    // Auto SOS trigger
    sendSOS({
      latitude: 0,
      longitude: 0, // location can be injected later
    });

    Alert.alert(
      'Emergency Triggered',
      'Gesture detected. SOS alert sent automatically.'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Gesture Setup</Text>
      <Text style={styles.subtitle}>
        Configure a hand gesture that triggers SOS when Guardian Mode is ON.
      </Text>

      <Text style={styles.label}>Gesture Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Open Palm"
        placeholderTextColor={COLORS.textSecondary}
        value={gestureName}
        onChangeText={setGestureName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Describe how this gesture triggers SOS"
        placeholderTextColor={COLORS.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <PrimaryButton
        title="Test Gesture Detection"
        onPress={() => setShowDetector(true)}
        style={{ marginTop: SPACING.md }}
      />

      <PrimaryButton
        title="Save Gesture"
        onPress={handleSave}
        style={{ marginTop: SPACING.lg }}
      />

      {/* ========== MEDIA PIPE MODAL ========== */}
      <Modal visible={showDetector} animationType="slide">
        <WebView
          source={require('../../assets/mediapipe.html')}
          onMessage={handleGestureDetected}
          javaScriptEnabled
        />
      </Modal>
    </View>
  );
};

export default GestureScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: FONT.caption,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
