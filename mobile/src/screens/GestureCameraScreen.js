// src/screens/GestureCameraScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ─── Gesture display names ────────────────────────────────────────────────
const GESTURE_LABELS = {
  waving:     { title: 'Rigorous Waving',  icon: '〜', instruction: 'Wave your hand rapidly in front of the camera' },
  fist:       { title: 'Closed Fist',      icon: '◆', instruction: 'Hold a tight clenched fist facing the camera' },
  open_palm:  { title: 'Open Palm',        icon: '▣', instruction: 'Hold a flat open palm clearly facing the camera' },
};

// ─── Random confidence step generator ────────────────────────────────────
// Returns a realistic-looking float increment: sometimes tiny, sometimes a bigger
// jump, occasionally a slight dip — mimics a real ML confidence signal
const nextConfidenceDelta = (current) => {
  const rand = Math.random();

  // 8% chance of a small dip (detection wobble)
  if (rand < 0.08 && current > 15) {
    return -(Math.random() * 3.5 + 0.5);          // -0.5 to -4.0
  }

  // 12% chance of a stall (model processing)
  if (rand < 0.20) {
    return Math.random() * 0.4;                    // 0.0 to 0.4
  }

  // 50% chance of a small steady increment
  if (rand < 0.70) {
    return Math.random() * 2.8 + 0.3;             // 0.3 to 3.1
  }

  // 30% chance of a bigger jump (model lock-on)
  return Math.random() * 5.5 + 1.5;               // 1.5 to 7.0
};

// ─── Confidence color ─────────────────────────────────────────────────────
const confidenceColor = (val) => {
  if (val < 40) return '#EF4444';   // red — not detected
  if (val < 70) return '#F59E0B';   // amber — weak
  if (val < 88) return '#38BDF8';   // blue — good
  return '#10B981';                 // green — locked
};

const confidenceLabel = (val) => {
  if (val < 40) return 'Searching…';
  if (val < 70) return 'Weak signal';
  if (val < 88) return 'Detecting…';
  return 'LOCKED';
};

// ─── Main screen ──────────────────────────────────────────────────────────
function GestureCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [confidence, setConfidence]     = useState(0);
  const [triggered, setTriggered]       = useState(false);
  const cameraRef   = useRef(null);
  const navigation  = useNavigation();
  const route       = useRoute();

  const gestureKey  = route?.params?.gesture || 'fist';
  const gestureMeta = GESTURE_LABELS[gestureKey] || GESTURE_LABELS.fist;

  // ── Animations ──────────────────────────────────────────────────────────
  // barWidth is a plain state value — avoids JS/native driver conflicts
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const fadeIn      = useRef(new Animated.Value(0)).current;
  const scanLine    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    // Entrance fade
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Scanning line loop — store ref so it never double-starts
    const scanLoop = Animated.loop(
      Animated.timing(scanLine, { toValue: 1, duration: 2200, useNativeDriver: true })
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, []);

  // Bar width is derived directly from confidence state — no animation node needed

  // ── Pulse when locked — guard with ref to prevent re-starting on same node ──
  const pulseLoopRef = useRef(null);
  const wasLockedRef = useRef(false);

  useEffect(() => {
    const isLocked = confidence >= 88;
    if (isLocked && !wasLockedRef.current) {
      wasLockedRef.current = true;
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else if (!isLocked && wasLockedRef.current) {
      wasLockedRef.current = false;
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
      pulseAnim.setValue(1);
    }
  }, [confidence >= 88]);

  // ── Simulated confidence ticker ──────────────────────────────────────────
  useEffect(() => {
    if (triggered) return;

    // Variable interval: faster when low, slightly slower when high (model settling)
    const tick = () => {
      setConfidence(prev => {
        if (prev >= 100) return 100;
        const delta = nextConfidenceDelta(prev);
        const next  = Math.max(0, Math.min(100, prev + delta));

        // Auto-trigger when we hit 100
        if (next >= 100 && !triggered) {
          setTriggered(true);
          setTimeout(() => {
            navigation.navigate('SOS', { triggerType: 'gesture' });
          }, 600);
        }

        return next;
      });
    };

    // Randomise interval too: 300–700ms
    const scheduleNext = () => {
      const delay = Math.random() * 400 + 280;
      return setTimeout(() => {
        tick();
        timerRef.current = scheduleNext();
      }, delay);
    };

    const timerRef = { current: scheduleNext() };
    return () => clearTimeout(timerRef.current);
  }, [triggered]);

  const handleDetect = () => {
    if (confidence >= 88) {
      navigation.navigate('SOS', { triggerType: 'gesture' });
    } else {
      Alert.alert(
        'Gesture Not Locked',
        `Keep showing your gesture. Confidence: ${Math.round(confidence)}%`,
        [{ text: 'OK' }]
      );
    }
  };

  const color = confidenceColor(confidence);
  const label = confidenceLabel(confidence);

  // ── Permission loading ───────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.permContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.permText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permCard}>
          <Text style={styles.permIcon}>◉</Text>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permSub}>
            GuardianX needs the camera to detect your emergency gesture
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>ALLOW CAMERA</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060A14" translucent={false} />

      <LinearGradient
        colors={['#060A14', '#0C1628', '#060A14']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity: fadeIn }]}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.gestureTag}>
            <Text style={styles.gestureTagIcon}>{gestureMeta.icon}</Text>
            <Text style={styles.gestureTagText}>{gestureMeta.title}</Text>
          </View>

          <View style={{ width: 36 }} />
        </View>

        {/* ── Confidence readout ── */}
        <Animated.View style={[styles.confidenceBlock, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={[styles.confidenceValue, { color }]}>
            {Math.round(confidence)}<Text style={styles.pctSign}>%</Text>
          </Text>
          <View style={[styles.statusPill, { borderColor: color, backgroundColor: `${color}18` }]}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <Text style={[styles.statusLabel, { color }]}>{label}</Text>
          </View>
        </Animated.View>

        {/* ── Progress bar ── */}
        <View style={styles.barTrack}>
          {/* Segmented tick marks */}
          {[25, 50, 75].map(pct => (
            <View key={pct} style={[styles.tickMark, { left: `${pct}%` }]} />
          ))}
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(confidence, 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
          {/* Threshold marker at 88% */}
          <View style={styles.thresholdMarker} />
        </View>
        <View style={styles.barLabels}>
          <Text style={styles.barLabelText}>0%</Text>
          <Text style={[styles.barLabelText, { color: '#10B981' }]}>Lock at 88%</Text>
          <Text style={styles.barLabelText}>100%</Text>
        </View>

        {/* ── Camera viewport ── */}
        <View style={styles.viewportWrapper}>
          {/* Corner brackets */}
          {[
            { top: 0, left: 0,  borderTopWidth: 3, borderLeftWidth: 3 },
            { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
            { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3 },
            { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
          ].map((corner, i) => (
            <View key={i} style={[styles.bracket, corner, { borderColor: color }]} />
          ))}

          <CameraView style={styles.camera} ref={cameraRef} facing="front" />

          {/* Scanning line */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanLine.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.72],
                  }),
                }],
                backgroundColor: color,
              },
            ]}
          />

          {/* Lock overlay */}
          {confidence >= 88 && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockOverlayText}>◉  GESTURE LOCKED</Text>
            </View>
          )}
        </View>

        {/* ── Instruction ── */}
        <Text style={styles.instruction}>{gestureMeta.instruction}</Text>

        {/* ── Detect button ── */}
        <TouchableOpacity
          style={[
            styles.detectBtn,
            confidence >= 88 && styles.detectBtnReady,
          ]}
          onPress={handleDetect}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={confidence >= 88 ? ['#10B981', '#059669'] : ['#1E3A4A', '#152A38']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.detectBtnGrad}
          >
            <Text style={[styles.detectBtnText, { color: confidence >= 88 ? '#FFFFFF' : '#475569' }]}>
              {confidence >= 88 ? 'TRIGGER SOS NOW' : 'AWAITING LOCK…'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

export default GestureCameraScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060A14' },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 28,
    alignItems: 'center',
  },

  // ── Permission ──
  permContainer: {
    flex: 1,
    backgroundColor: '#060A14',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  permCard: {
    width: '100%',
    backgroundColor: '#0D1526',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  permIcon:    { fontSize: 40, color: '#14B8A6', marginBottom: 16 },
  permTitle:   { fontSize: 18, fontWeight: '800', color: '#E2E8F0', marginBottom: 8, textAlign: 'center' },
  permSub:     { fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  permText:    { fontSize: 14, color: '#475569' },
  permBtn: {
    backgroundColor: '#14B8A6',
    paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 12,
  },
  permBtnText: { fontSize: 13, fontWeight: '800', color: '#060A14', letterSpacing: 1.5 },

  // ── Top bar ──
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: '#1E293B',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { color: '#475569', fontSize: 16, fontWeight: '600' },
  gestureTag: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(20,184,166,0.08)',
    borderWidth: 1, borderColor: 'rgba(20,184,166,0.25)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
  },
  gestureTagIcon: { fontSize: 14, color: '#14B8A6' },
  gestureTagText: { fontSize: 11, fontWeight: '700', color: '#14B8A6', letterSpacing: 1 },

  // ── Confidence readout ──
  confidenceBlock: { alignItems: 'center', marginBottom: 16 },
  confidenceValue: {
    fontSize: 64, fontWeight: '900',
    letterSpacing: -2, lineHeight: 72,
    includeFontPadding: false,
  },
  pctSign: { fontSize: 32, fontWeight: '700', letterSpacing: 0 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 5,
    marginTop: 6,
  },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },

  // ── Progress bar ──
  barTrack: {
    width: '100%', height: 8,
    backgroundColor: '#0D1526',
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 6,
    borderWidth: 1, borderColor: '#1E293B',
  },
  barFill: {
    position: 'absolute', top: 0, left: 0,
    height: '100%', borderRadius: 4,
  },
  tickMark: {
    position: 'absolute', top: -3,
    width: 1, height: 14,
    backgroundColor: '#1E293B',
  },
  thresholdMarker: {
    position: 'absolute', top: -4,
    left: '88%',
    width: 2, height: 16,
    backgroundColor: 'rgba(16,185,129,0.6)',
    borderRadius: 1,
  },
  barLabels: {
    width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', marginBottom: 16,
  },
  barLabelText: { fontSize: 9, fontWeight: '600', color: '#2D3F52', letterSpacing: 0.5 },

  // ── Camera viewport ──
  viewportWrapper: {
    width: width - 40,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    backgroundColor: '#0A0E1A',
  },
  camera: { flex: 1 },
  bracket: {
    position: 'absolute',
    width: 22, height: 22,
    zIndex: 10,
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1.5,
    opacity: 0.45,
    zIndex: 5,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingVertical: 10,
    backgroundColor: 'rgba(16,185,129,0.85)',
    alignItems: 'center',
    zIndex: 20,
  },
  lockOverlayText: {
    fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2,
  },

  // ── Instruction ──
  instruction: {
    fontSize: 12,
    color: '#3D5068',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // ── Detect button ──
  detectBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  detectBtnReady: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  detectBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  detectBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 2.2 },
});