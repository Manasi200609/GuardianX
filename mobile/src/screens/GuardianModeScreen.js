// src/screens/GuardianModeScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { Accelerometer } from 'expo-sensors';
import { GuardianContext } from '../context/GuardianContext';
import { COLORS, SPACING, RADIUS, FONT } from '../utils/theme';
import gestureDetectionService from '../services/gestureDetection';
import * as Location from 'expo-location';

const GuardianModeScreen = () => {
  const navigation = useNavigation();
  const { isActive, user } = useContext(GuardianContext);
  const [locationStatus, setLocationStatus] = useState('initializing');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showCamera, setShowCamera] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('🛡️ Standby');
  const [motionSub, setMotionSub] = useState(null);
  const lastShakeTime = useRef(0);
  const webViewRef = useRef(null);

  const SHAKE_THRESHOLD = 2.5; // Vigorous shake threshold
  const SHAKE_WINDOW = 500; // 500ms window for shake

  useEffect(() => {
    if (isActive) {
      initializeGuardianMode();
    } else {
      cleanupGuardianMode();
    }

    return () => {
      cleanupGuardianMode();
    };
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive, pulseAnim]);

  const initializeGuardianMode = async () => {
    console.log('🛡️ Initializing Guardian Mode...');

    try {
      // Set up emergency callback
      gestureDetectionService.initialize((emergencyData) => {
        console.log('🚨 EMERGENCY DETECTED IN CALLBACK:', emergencyData);
        setDetectionStatus('🚨 SOS TRIGGERED!');
        
        // Close camera and navigate to SOS screen
        setShowCamera(false);
        setTimeout(() => {
          navigation.replace('SOS', {
            autoSent: true,
            triggerType: 'gesture',
          });
        }, 500);
      });

      // Start detection (but don't open camera yet)
      await gestureDetectionService.startDetection();
      setDetectionStatus('🎯 Listening for shake...');
      console.log('✅ Gesture monitoring initialized (camera closed)');
    } catch (error) {
      console.error('❌ Gesture detection failed:', error);
      setDetectionStatus('❌ Error');
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationStatus('active');
        console.log('✅ Location tracking active');
      } else {
        setLocationStatus('permission_denied');
      }
    } catch (error) {
      console.error('❌ Location tracking failed:', error);
      setLocationStatus('error');
    }

    // Start accelerometer for shake detection
    startShakeDetection();
  };

  const startShakeDetection = () => {
    try {
      Accelerometer.setUpdateInterval(100);
      const sub = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (magnitude > SHAKE_THRESHOLD) {
          if (now - lastShakeTime.current > SHAKE_WINDOW) {
            console.log('📳 VIGOROUS SHAKE DETECTED! Opening camera...');
            lastShakeTime.current = now;
            setShowCamera(true);
            setDetectionStatus('📷 Camera Active - Show gesture!');
            
            // Auto-close camera after 30 seconds if no detection
            setTimeout(() => {
              if (showCamera) {
                setShowCamera(false);
                setDetectionStatus('🎯 Listening for shake...');
              }
            }, 30000);
          }
        }
      });

      setMotionSub(sub);
      console.log('✅ Shake detection started');
    } catch (error) {
      console.error('❌ Failed to start shake detection:', error);
    }
  };

  const cleanupGuardianMode = () => {
    console.log('🛑 Cleaning up Guardian Mode...');
    gestureDetectionService.stopDetection();
    setLocationStatus('inactive');
    setDetectionStatus('Inactive');
    setShowCamera(false);

    if (motionSub) {
      motionSub.remove();
      setMotionSub(null);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView Message Received:', data);
      
      // Pass to gesture detection service
      if (gestureDetectionService) {
        gestureDetectionService.handleMediaPipeResult(data);
      }
    } catch (error) {
      console.error('❌ Failed to parse WebView message:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active' || status === true) return COLORS.success;
    if (status === 'initializing') return COLORS.warning;
    if (status === 'error' || status === 'permission_denied') return COLORS.danger;
    return COLORS.inactive;
  };

  const getStatusText = (status) => {
    if (status === true || status === 'active') return 'Active';
    if (status === 'initializing') return 'Initializing...';
    if (status === 'permission_denied') return 'Permission Denied';
    if (status === 'error') return 'Error';
    return 'Inactive';
  };

  if (!isActive) {
    return (
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0', '#F1F5F9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.inactiveContainer}>
          <Text style={styles.inactiveTitle}>Guardian Mode</Text>
          <Text style={styles.inactiveSubtitle}>
            Activate Guardian Mode to enable hands-free emergency detection
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* MediaPipe Camera Modal - Opens on shake */}
      <Modal 
        visible={showCamera} 
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <WebView
            ref={webViewRef}
            source={require('../../assets/mediapipe.html')}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            startInLoadingState={false}
            scalesPageToFit={true}
            style={styles.webview}
            originWhitelist={['*']}
            allowFileAccess={true}
          />
          
          {/* Status Overlay */}
          <View style={styles.statusOverlay}>
            <Text style={styles.statusText}>📷 Detecting gesture...</Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeCamera}
            onPress={() => {
              setShowCamera(false);
              setDetectionStatus('🎯 Listening for shake...');
            }}
          >
            <Text style={styles.closeCameraText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.statusIndicator,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: COLORS.primary,
              },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Guardian Mode Active</Text>
            <Text style={styles.subtitle}>System is monitoring your safety</Text>
          </View>
        </View>

        {/* System Status Cards */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>SYSTEM STATUS</Text>

          {/* Gesture Detection */}
          <View style={styles.statusCard}>
            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: COLORS.success },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Gesture Detection</Text>
                <Text style={styles.statusValue}>
                  {detectionStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Location Tracking */}
          <View style={styles.statusCard}>
            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(locationStatus) },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Location Tracking</Text>
                <Text style={styles.statusValue}>
                  {getStatusText(locationStatus)}
                </Text>
              </View>
            </View>
            <Text style={styles.statusIcon}>📍</Text>
          </View>
        </View>

        {/* Emergency Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW TO TRIGGER SOS</Text>
          <View style={styles.triggerList}>
            <View style={styles.triggerItem}>
              <Text style={styles.triggerIcon}>📳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.triggerTitle}>Step 1: Shake Phone Vigorously</Text>
                <Text style={styles.triggerDesc}>Shake your phone with force</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.triggerItem}>
              <Text style={styles.triggerIcon}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.triggerTitle}>Step 2: Camera Opens Automatically</Text>
                <Text style={styles.triggerDesc}>Hand gesture detection begins</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.triggerItem}>
              <Text style={styles.triggerIcon}>👊</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.triggerTitle}>Step 3: Show Clenched Fist</Text>
                <Text style={styles.triggerDesc}>Hold fist for 3 seconds</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.triggerItem}>
              <Text style={styles.triggerIcon}>🚨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.triggerTitle}>Step 4: SOS Triggered</Text>
                <Text style={styles.triggerDesc}>Emergency alerts sent to contacts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>⚡ Quick Actions</Text>
          <Text style={styles.instructionText}>
            • Shake phone vigorously to activate camera{'\n'}
            • Camera will automatically close after 30 seconds{'\n'}
            • Show a clenched fist to the camera{'\n'}
            • Hold fist for 3 seconds to trigger SOS
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  inactiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  inactiveTitle: {
    fontSize: FONT.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inactiveSubtitle: {
    fontSize: FONT.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  subtitle: {
    fontSize: FONT.body,
    color: '#94a3b8',
    marginTop: SPACING.xs,
  },
  statusSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT.caption,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
  },
  statusTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  statusValue: {
    fontSize: FONT.caption,
    color: '#94a3b8',
    marginTop: SPACING.xs,
  },
  statusIcon: {
    fontSize: 20,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  triggerList: {
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: SPACING.lg,
  },
  triggerIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  triggerTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  triggerDesc: {
    fontSize: FONT.caption,
    color: '#94a3b8',
    marginTop: SPACING.xs,
  },
  instructionBox: {
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructionTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: SPACING.md,
  },
  instructionText: {
    fontSize: FONT.body,
    color: '#94a3b8',
    lineHeight: 22,
  },
  webview: {
    flex: 1,
  },
  statusOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  statusText: {
    color: '#1de9b6',
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  closeCamera: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  closeCameraText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GuardianModeScreen;