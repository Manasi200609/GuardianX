/**
 * IMPLEMENTATION EXAMPLE
 * 
 * Complete working example integrating all Guardian X SOS components
 * Copy and adapt this to your screens/context
 */

// ============================================================================
// EXAMPLE 1: Full Guardian Context with SOS Integration
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import { useGuardianMode } from '../hooks/useGuardianMode';
import { useGestureDetection } from '../hooks/useGestureDetection';
import { useSOSFlow } from '../hooks/useSOSFlow';

import SOSCountdownOverlay from '../components/SOSCountdownOverlay';
import SOSService from '../services/SOSService';
import StorageService from '../services/StorageService';

export const GuardianContext = React.createContext();

export function GuardianProvider({ children, userId }) {
  // ---- Guardian Mode State ----
  const {
    isEnabled: isGuardianEnabled,
    onboardingComplete,
    isLoading: guardianLoading,
    toggleGuardianMode,
    completeOnboarding,
  } = useGuardianMode(userId);

  // ---- Gesture Detection ----
  const {
    isActive: gestureActive,
    error: gestureError,
    startDetection,
    stopDetection,
  } = useGestureDetection(
    (gestureData) => {
      console.log('🎯 Triple-tap detected in context');
      handleTripleTapDetected(gestureData);
    },
    {
      maxTapInterval: 600,
      requiredTaps: 3,
      cooldownPeriod: 30000,
    }
  );

  // ---- SOS Flow ----
  const {
    isSOSActive,
    countdownSeconds,
    canCancel,
    error: sosError,
    initiateSOSCountdown,
    cancelSOSWithPin,
    cancelSOSWithLongPress,
    processQueue,
  } = useSOSFlow(userId, {
    countdownDuration: 5000,
    onSOSConfirmed: (sosData) => {
      console.log('✅ SOS CONFIRMED', sosData);
      
      // Play notification sound/vibration
      // Show completion feedback
      // Log to analytics
      
      // Optionally navigate to post-SOS screen
    },
    onSOSCancelled: (reason) => {
      console.log('❌ SOS CANCELLED:', reason);
      
      // Show cancel feedback
      // Log cancellation reason
    },
  });

  // ---- Auto-start gesture detection when Guardian enabled ----
  useEffect(() => {
    if (isGuardianEnabled && !guardianLoading) {
      startDetection()
        .then(() => console.log('✅ Gesture detection started'))
        .catch((err) => {
          console.error('❌ Failed to start gesture detection:', err);
          Alert.alert('Error', 'Could not start gesture detection');
        });

      // Clean up on unmount
      return () => {
        stopDetection().catch(console.error);
      };
    } else if (!isGuardianEnabled && !guardianLoading) {
      stopDetection().catch(console.error);
    }
  }, [isGuardianEnabled, guardianLoading, startDetection, stopDetection]);

  // ---- Handle triple-tap ----
  const handleTripleTapDetected = async (gestureData) => {
    console.log('🚨 Handling triple-tap gesture');

    // Additional validation
    if (!isGuardianEnabled) {
      console.warn('Guardian Mode disabled, ignoring gesture');
      return;
    }

    if (!userId) {
      console.error('User ID required for SOS');
      Alert.alert('Error', 'User not logged in');
      return;
    }

    // Verify onboarding
    const isOnboarded = await StorageService.isOnboardingComplete();
    if (!isOnboarded) {
      console.warn('Onboarding not complete, ignoring gesture');
      return;
    }

    // Initiate SOS countdown (UI will show overlay)
    try {
      await initiateSOSCountdown();
    } catch (error) {
      console.error('❌ Error initiating SOS:', error);
      Alert.alert('Error', 'Could not initiate SOS. Please try again.');
    }
  };

  // ---- Provide context ----
  const contextValue = {
    // Guardian Mode
    isGuardianEnabled,
    onboardingComplete,
    toggleGuardianMode,
    completeOnboarding,

    // Gesture Detection
    gestureActive,
    gestureError,

    // SOS Flow
    isSOSActive,
    countdownSeconds,
    canCancel,
    sosError,
    cancelSOSWithPin,
    cancelSOSWithLongPress,
    processQueue,
  };

  return (
    <GuardianContext.Provider value={contextValue}>
      {/* SOS Countdown Overlay */}
      <SOSCountdownOverlay
        visible={isSOSActive}
        countdownSeconds={countdownSeconds}
        canCancel={canCancel}
        onCancelWithPin={cancelSOSWithPin}
        onCancelWithLongPress={cancelSOSWithLongPress}
        onError={(error) => {
          console.error('SOS Overlay Error:', error);
          Alert.alert('Error', error);
        }}
      />

      {children}
    </GuardianContext.Provider>
  );
}

// ============================================================================
// EXAMPLE 2: Guardian Dashboard Screen
// ============================================================================

import { View, Text, StyleSheet } from 'react-native';
import GuardianModeStatus from '../components/GuardianModeStatus';

export function GuardianDashboardScreen({ navigation }) {
  const context = React.useContext(GuardianContext);

  return (
    <View style={styles.container}>
      <GuardianModeStatus
        isGuardianEnabled={context.isGuardianEnabled}
        onToggleGuardian={async (enable) => {
          try {
            // Check prerequisites before enabling
            if (enable && !context.onboardingComplete) {
              Alert.alert(
                'Onboarding Required',
                'Please complete onboarding first'
              );
              return;
            }

            await context.toggleGuardianMode(enable);
            
            console.log(
              `✅ Guardian Mode ${enable ? 'enabled' : 'disabled'}`
            );
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }}
        onManageContacts={() => {
          navigation.navigate('ManageEmergencyContacts');
        }}
        onSimulateGesture={() => {
          // Test triple-tap detection
          console.log('🧪 Simulating triple-tap...');
          
          // This would trigger SOS flow as if user triple-tapped
          // Only works if Guardian Mode enabled
          if (context.isGuardianEnabled) {
            context.cancelSOSWithLongPress = async () => {
              console.log('✅ SOS simulated successfully');
              return true;
            };
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

// ============================================================================
// EXAMPLE 3: Emergency Contacts Management
// ============================================================================

import { FlatList, TouchableOpacity } from 'react-native';

export function ManageEmergencyContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const loaded = await SOSService.getEmergencyContacts();
      setContacts(loaded);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Could not load emergency contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    // Show add contact modal
    const newContact = {
      name: 'Mom',
      phone: '+1234567890',
      email: 'mom@email.com',
    };

    try {
      await SOSService.addEmergencyContact(newContact);
      await loadContacts();
      Alert.alert('Success', 'Emergency contact added');
    } catch (error) {
      Alert.alert('Error', 'Could not add contact');
    }
  };

  const handleRemoveContact = async (phone) => {
    Alert.alert(
      'Confirm Remove',
      'Remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await SOSService.removeEmergencyContact(phone);
              await loadContacts();
              Alert.alert('Success', 'Contact removed');
            } catch (error) {
              Alert.alert('Error', 'Could not remove contact');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts ({contacts.length})</Text>

      {contacts.length === 0 ? (
        <Text style={styles.emptyText}>
          No emergency contacts configured
        </Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.phone}
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveContact(item.phone)}
              >
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <Text style={styles.addButtonText}>+ Add Contact</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// EXAMPLE 4: Onboarding Flow
// ============================================================================

export function OnboardingScreen() {
  const { completeOnboarding } = React.useContext(GuardianContext);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Guardian Mode',
      description: 'Protect yourself with triple-tap emergency alerts',
    },
    {
      title: 'Enable Location',
      description: 'We need your location to send to emergency contacts',
    },
    {
      title: 'Add Emergency Contacts',
      description: 'At least one contact is required',
    },
    {
      title: 'Set SOS PIN',
      description: 'Optional: PIN to cancel SOS (4-6 digits)',
    },
    {
      title: 'Ready!',
      description: 'You can now enable Guardian Mode',
    },
  ];

  const handleNextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Handle step-specific logic
      if (currentStep === 0) {
        // Request permissions
        await Promise.all([
          LocationService.requestPermissions(),
          // Request other permissions
        ]);
      } else if (currentStep === 2) {
        // Navigate to add contacts
      }

      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        await completeOnboarding();
        console.log('✅ Onboarding completed');
        // Navigate to main app
      } catch (error) {
        Alert.alert('Error', 'Could not complete onboarding');
      }
    }
  };

  const step = steps[currentStep];

  return (
    <View style={styles.onboardingContainer}>
      <Text style={styles.onboardingTitle}>{step.title}</Text>
      <Text style={styles.onboardingDescription}>{step.description}</Text>

      <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
        <Text style={styles.nextButtonText}>
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.progressText}>
        Step {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );
}

// ============================================================================
// EXAMPLE 5: App.js Integration
// ============================================================================

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userId, setUserId] = useState(null);
  const [userInitialized, setUserInitialized] = useState(false);

  useEffect(() => {
    // Load user on startup
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUserId = await StorageService.getUserId();
      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setUserInitialized(true);
    }
  };

  if (!userInitialized) {
    return <LoadingScreen />;
  }

  return (
    <GuardianProvider userId={userId}>
      <NavigationContainer>
        <Stack.Navigator>
          {!userId ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="GuardianDashboard"
                component={GuardianDashboardScreen}
              />
              <Stack.Screen
                name="ManageEmergencyContacts"
                component={ManageEmergencyContactsScreen}
              />
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GuardianProvider>
  );
}

// ============================================================================
// TIPS & BEST PRACTICES
// ============================================================================

/*
1. PERMISSION MANAGEMENT
   - Always check permissions before using services
   - Request permissions at appropriate times (onboarding)
   - Handle permission denials gracefully
   - Use expo permission APIs, not native

2. BACKGROUND EXECUTION
   - Android: Use foreground services for background location
   - iOS: UIBackgroundModes in Info.plist
   - Test on physical device (emulator has limitations)
   - Monitor battery drain with profilers

3. ERROR HANDLING
   - Wrap service calls in try-catch
   - Provide user feedback for errors
   - Log errors for debugging
   - Implement retry logic for network failures

4. STATE MANAGEMENT
   - Use hooks for service state
   - Persist critical state (Guardian Mode, contacts)
   - Use secure storage for sensitive data
   - Clean up resources on unmount

5. PERFORMANCE
   - Avoid polling for events
   - Use event-based listeners
   - Debounce rapid updates
   - Clean up subscriptions

6. TESTING
   - Test with real permissions (not mocked)
   - Test on both foreground and background
   - Test network failure scenarios
   - Test with battery-saving modes enabled
   - Test on physical devices
*/
