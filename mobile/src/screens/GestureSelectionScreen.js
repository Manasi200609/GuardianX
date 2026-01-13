// src/screens/GestureSelectionScreen.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import { GuardianContext } from '../context/GuardianContext';

const GestureSelectionScreen = ({ navigation }) => {
  const { gesturePreferences, toggleGesturePreference } =
    useContext(GuardianContext);
  const handleSelect = (gesture) => {
    // TODO: save gesture to backend/context if needed
    navigation.navigate('GestureCamera', { gesture });  // 👈 open camera
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose SOS Gesture</Text>

      <View style={styles.card}>
        <View>
          <Text style={styles.label}>✋ Rigorous Waving</Text>
          <Text style={styles.sub}>Raise and wave your hand rapidly</Text>
        </View>
        <Switch
          value={gesturePreferences.waving}
          onValueChange={(value) => {
            toggleGesturePreference('waving');
            if (value) {
              handleSelect('waving');
            }
          }}
      />
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.label}>✊ Closed Fist</Text>
          <Text style={styles.sub}>Hold a tight fist in front of camera</Text>
        </View>
           <Switch
            value={gesturePreferences.fist}
            onValueChange={(value) => {
              toggleGesturePreference('fist');
              if (value) {
                handleSelect('fist');
              }
            }}
          />
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.label}>🖐️ Open Palm</Text>
          <Text style={styles.sub}>Show a clear open palm</Text>
        </View>
        <Switch
          value={gesturePreferences.open_palm}
          onValueChange={(value) => {
            toggleGesturePreference('open_palm');
            if (value) {
              handleSelect('open_palm');
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#9ca3af',
  },
});

export default GestureSelectionScreen;
