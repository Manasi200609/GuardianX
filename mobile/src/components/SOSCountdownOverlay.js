/**
 * SOSCountdownOverlay.js
 * 
 * Displays a 5-second countdown overlay with cancel options (PIN or long-press)
 * 
 * Features:
 * - Smooth countdown animation
 * - PIN entry for cancellation
 * - Long-press to cancel
 * - Haptic feedback on countdown updates
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Vibration,
  PanResponder,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { LockClosedIcon, XMarkIcon } from 'react-native-heroicons/outline';

const SOSCountdownOverlay = ({
  visible,
  countdownSeconds,
  canCancel,
  onCancelWithPin,
  onCancelWithLongPress,
  onError,
}) => {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const longPressTimer = useRef(null);
  const panResponder = useRef(null);

  // Animate countdown pulse
  useEffect(() => {
    if (countdownSeconds > 0 && countdownSeconds <= 5) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Vibrate on each second
      try {
        Vibration.vibrate(100);
      } catch (error) {
        console.warn('⚠️ Vibration failed');
      }
    }
  }, [countdownSeconds, scaleAnim, opacityAnim]);

  // Setup pan responder for long-press detection
  useEffect(() => {
    if (canCancel && !showPinInput && visible) {
      panResponder.current = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
      });
    }
  }, [canCancel, showPinInput, visible]);

  /**
   * Handle PIN submission
   */
  const handlePinSubmit = async () => {
    if (!pin || pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }

    try {
      setIsProcessing(true);
      setPinError(null);

      const result = await onCancelWithPin(pin);

      if (result) {
        // Success - reset state
        setPin('');
        setShowPinInput(false);
        setIsProcessing(false);
        Vibration.vibrate([100, 50, 100], false);
      } else {
        // Failed
        setPinError('Invalid PIN. Try again.');
        setPin('');
        Vibration.vibrate([200, 100, 200], false);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ PIN submission error:', error);
      setPinError('Error processing PIN');
      setIsProcessing(false);
    }
  };

  /**
   * Handle long-press to cancel
   */
  const handleLongPressStart = () => {
    if (!canCancel || showPinInput) return;

    console.log('👆 Long-press started');
    longPressTimer.current = setTimeout(async () => {
      console.log('👆 Long-press completed - cancelling SOS');
      Vibration.vibrate([100, 50, 100, 50, 100], false);

      try {
        await onCancelWithLongPress();
      } catch (error) {
        console.error('❌ Long-press cancel error:', error);
        if (onError) {
          onError(error.message);
        }
      }
    }, 2000); // 2 second long-press
  };

  /**
   * Handle long-press end
   */
  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const getCountdownColor = () => {
    if (countdownSeconds <= 1) return '#FF0000'; // Red
    if (countdownSeconds <= 2) return '#FF6600'; // Orange
    if (countdownSeconds <= 3) return '#FFB300'; // Yellow
    return '#FF0000'; // Red by default
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* SOS Content */}
        <View style={styles.content}>
          {/* Countdown Circle */}
          <Animated.View
            style={[
              styles.countdownCircle,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
                borderColor: getCountdownColor(),
              },
            ]}
          >
            <AlertCircle size={60} color={getCountdownColor()} />
            <Text
              style={[
                styles.countdownText,
                { color: getCountdownColor() },
              ]}
            >
              {countdownSeconds}
            </Text>
            <Text style={styles.sosPulseText}>
              {countdownSeconds === 0
                ? 'SENDING SOS...'
                : 'EMERGENCY ALERT'}
            </Text>
          </Animated.View>

          {/* Status Message */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>⚠️ Emergency Alert Active</Text>
            <Text style={styles.statusMessage}>
              {showPinInput
                ? 'Enter your PIN to cancel'
                : canCancel
                  ? 'Press & hold to cancel (2 seconds)'
                  : 'Too late to cancel'}
            </Text>
          </View>

          {/* PIN Input (if enabled) */}
          {showPinInput && canCancel && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.pinContainer}
            >
              <LockClosedIcon size={24} color="#FF0000" />
              <TextInput
                style={styles.pinInput}
                placeholder="Enter PIN"
                placeholderTextColor="#999"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                editable={!isProcessing}
                value={pin}
                onChangeText={setPin}
              />
              {pinError && (
                <Text style={styles.pinError}>{pinError}</Text>
              )}
              <View style={styles.pinButtonContainer}>
                <TouchableOpacity
                  style={[styles.pinButton, styles.pinCancelButton]}
                  onPress={() => {
                    setShowPinInput(false);
                    setPin('');
                    setPinError(null);
                  }}
                  disabled={isProcessing}
                >
                  <Text style={styles.pinButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pinButton, styles.pinSubmitButton]}
                  onPress={handlePinSubmit}
                  disabled={isProcessing || !pin}
                >
                  <Text style={styles.pinButtonText}>
                    {isProcessing ? 'Verifying...' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}

          {/* Cancel Options */}
          {!showPinInput && (
            <View style={styles.actionsContainer}>
              {/* Long-Press Cancel Button */}
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  !canCancel && styles.cancelButtonDisabled,
                ]}
                onPressIn={handleLongPressStart}
                onPressOut={handleLongPressEnd}
                disabled={!canCancel || showPinInput}
              >
                <Text style={styles.cancelButtonText}>
                  {canCancel ? 'Press & Hold to Cancel' : 'Cannot Cancel'}
                </Text>
              </TouchableOpacity>

              {/* PIN Cancel Option */}
              {canCancel && (
                <TouchableOpacity
                  style={styles.pinOptionButton}
                  onPress={() => setShowPinInput(true)}
                >
                  <LockClosedIcon size={18} color="#666" />
                  <Text style={styles.pinOptionText}>Cancel with PIN</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Emergency Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              ✓ Location being transmitted
            </Text>
            <Text style={styles.infoText}>
              ✓ Emergency contacts notified
            </Text>
            <Text style={styles.infoText}>
              ✓ SOS recorded with timestamp
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  countdownCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    marginTop: 10,
  },
  sosPulseText: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  pinContainer: {
    marginBottom: 30,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FF0000',
    borderWidth: 2,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 8,
    marginVertical: 15,
    paddingVertical: 12,
  },
  pinError: {
    color: '#FF6600',
    fontSize: 14,
    marginBottom: 15,
  },
  pinButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  pinButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pinSubmitButton: {
    backgroundColor: '#FF0000',
  },
  pinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 30,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  cancelButtonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinOptionButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinOptionText: {
    color: '#FFF',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    fontSize: 13,
    color: '#FFF',
    marginVertical: 4,
  },
});

export default SOSCountdownOverlay;
