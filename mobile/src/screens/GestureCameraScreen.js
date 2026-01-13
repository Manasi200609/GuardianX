// src/screens/GestureCameraScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

function GestureCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [confidence, setConfidence] = useState(0);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  // Fake confidence increase
  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleDetect = () => {
    if (confidence >= 90) {
      navigation.navigate('SOS');
    } else {
      Alert.alert(
        'Not ready',
        `Keep showing your gesture. Confidence: ${Math.round(confidence)}%`
      );
    }
  };

  // Permission loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking camera permission...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>

        <TouchableOpacity style={styles.detectBtn} onPress={requestPermission}>
          <Text style={styles.detectText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Show your SOS gesture</Text>

      <View style={styles.confidenceBox}>
        <Text style={styles.confidenceLabel}>Confidence</Text>
        <Text style={styles.confidenceValue}>{Math.round(confidence)}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${confidence}%` }]} />
        </View>
      </View>

      <CameraView style={styles.camera} ref={cameraRef} />

      <TouchableOpacity style={styles.detectBtn} onPress={handleDetect}>
        <Text style={styles.detectText}>Detect Gesture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  text: {
    color: '#e5e7eb',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 30,
  },
  confidenceBox: {
    width: '100%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
  },
  camera: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    marginBottom: 20,
  },
  detectBtn: {
    padding: 16,
    backgroundColor: '#38bdf8',
    borderRadius: 12,
  },
  detectText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default GestureCameraScreen;