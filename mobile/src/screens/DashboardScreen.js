// src/screens/DashboardScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';


const DashboardScreen = ({ navigation }) => {
  const [guardianActive, setGuardianActive] = useState(false);
  const [location, setLocation] = React.useState(null);
  const [locationError, setLocationError] = React.useState(null);
  const [showSOSSheet, setShowSOSSheet] = useState(false);

    const handleAlertSOS = () => {
    setShowSOSSheet(true);

    // auto close after 5 seconds
    setTimeout(() => {
      setShowSOSSheet(false);
    }, 5000);
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
      setLocationError(null);
    } catch (e) {
      setLocationError('Could not get location');
    }
  };

  const toggleGuardian = async () => {
    const next = !guardianActive;
    setGuardianActive(next);

    if (next) {
      await startLocationTracking();
    } else {
      setLocation(null);
      setLocationError(null);
    }
  };

  const handleCall = () => {
    Alert.alert('Call 112', 'Here you will start a call to emergency services.');
  };

  const handleAlert = () => {
    Alert.alert('Alert sent', 'GuardianX would notify your emergency contacts.');
  };

  return (
    <View style={styles.app}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brand}>
            <View style={styles.brandRow}>
              <View style={styles.brandLogoCircle}>
                <Image
                  source={require('../../assets/guardianx-logo.png.jpeg')}
                  style={styles.brandLogoImg}
                />
              </View>
              <Text style={styles.brandTitle}>GuardianX</Text>
            </View>
            <Text style={styles.brandSubtitle}>Your safety companion</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <Text style={styles.iconLabel}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.iconLabel}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SHIELD AREA */}
      <TouchableOpacity onPress={toggleGuardian} activeOpacity={0.9}>
        <View style={styles.shieldSection}>
          <View style={styles.shieldOuter}>
            <View style={styles.shieldMiddle}>
              <View
                style={[
                  [styles.shieldInner, styles.shieldOuter],
                  guardianActive
                    ? [styles.shieldInnerActive, styles.shieldOuterActive]
                    : [styles.shieldInnerInactive, styles.shieldOuterInactive]
                ]}
              > 
                <Image
                  source={
                    guardianActive
                      ? require('../../assets/s2.jpeg') // shield with tick
                      : require('../../assets/s1.jpeg') // plain shield
                  }
                  style={styles.shieldImg}
                />
              </View>
            </View>
          </View>
          <Text
            style={[
              styles.guardianLabel,
              guardianActive
                ? styles.guardianLabelActive
                : styles.guardianLabelInactive,
            ]}
          >
            {guardianActive ? 'GUARDIAN ACTIVE' : 'TAP TO ACTIVATE'}
          </Text>
          <Text style={styles.guardianSub}>Monitoring your safety</Text>
        </View>
      </TouchableOpacity>

      {/* CARDS – switch content + style based on guardianActive */}
      {guardianActive ? (
        <>
          {/* LOCATION – ACTIVE (opens MapScreen) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Map')} // Stack.Screen name
          >
            <View style={[styles.card, styles.locationCard]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconCircle,
                    styles.cardIconLocationActive,
                  ]}
                >
                  <Text style={styles.cardIconEmoji}>📍</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>Location Tracking</Text>
                  <Text style={styles.cardStatusActive}>
                    Active &amp; Sharing
                  </Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Coordinates</Text>
                <Text style={styles.rowValue}>37.7722 , -122.4192</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Last Update</Text>
                <Text style={[styles.rowValue, styles.rowValueStrong]}>
                  11:00:09
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Accuracy</Text>
                <Text style={[styles.rowValue, styles.rowValueAccent]}>
                  ±14 m
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* GESTURE – ACTIVE */}
          <View style={[styles.card, styles.gestureCard]}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconCircle,
                  styles.cardIconGestureActive,
                ]}
              >
                <Text style={styles.cardIconEmoji}>⬚</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Gesture Detection</Text>
                <Text style={styles.cardSubActive}>
                  Triple Tap • high sensitivity
                </Text>
              </View>
            </View>
            <View style={styles.gestureIndicatorOn} />
          </View>
        </>
      ) : (
        <>
          {/* LOCATION – INACTIVE */}
          <View style={[styles.card, styles.locationCard, styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconCircle,
                  styles.cardIconLocationInactive,
                ]}
              >
                <Text style={styles.cardIconEmoji}>📍</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Location Tracking</Text>
                <Text style={styles.cardStatusInactive}>Inactive</Text>
              </View>
            </View>

            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Coordinates</Text>
              <Text style={[styles.rowValue, styles.rowValueMuted]}>
                -- , --
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Last Update</Text>
              <Text style={[styles.rowValue, styles.rowValueMuted]}>—</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Accuracy</Text>
              <Text style={[styles.rowValue, styles.rowValueMuted]}>—</Text>
            </View>
          </View>

          {/* GESTURE – INACTIVE */}
          <View style={[styles.card, styles.gestureCard, styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconCircle,
                  styles.cardIconGestureInactive,
                ]}
              >
                <Text style={styles.cardIconEmoji}>⬚</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Gesture Detection</Text>
                <Text style={styles.cardSubInactive}>
                  Triple Tap • high sensitivity
                </Text>
              </View>
            </View>
            <View style={styles.gestureIndicatorOff} />
          </View>
        </>
      )}

      {/* BOTTOM ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionTile, styles.actionCall]}
          onPress={handleCall}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionLabel}>Call 112</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, styles.actionAlert]}
          onPress={handleAlertSOS}  
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <Text style={styles.actionLabel}>Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, styles.actionRoute]}
          onPress={() => navigation.navigate('Route')}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionLabel}>Safe Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, styles.actionContacts]}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionLabel}>Contacts</Text>
        </TouchableOpacity>
      </View>
      {/* SOS BOTTOM SHEET */}
       <Modal
        transparent
        animationType="slide"
        visible={showSOSSheet}
        onRequestClose={() => setShowSOSSheet(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>🚨 SOS Activated</Text>

            <Text style={styles.sheetText}>
              Emergency alert has been sent to:
            </Text>

            <Text style={styles.contact}>• Mom</Text>
            <Text style={styles.contact}>• Sister</Text>
            <Text style={styles.contact}>• Local Police</Text>

            {location && (
              <Text style={styles.locationText}>
                📍 Location shared:
                {'\n'}
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowSOSSheet(false)}
            >
              <Text style={styles.closeText}>CLOSE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, styles.alertCard]}
              onPress={handleAlertSOS}  // ← MUST match the function name
>
               <Text style={styles.actionLabel}>Alert</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 16,
    paddingHorizontal: 20,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 40
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    marginLeft: 8,
  },
  iconLabel: {
    color: '#9ca3af',
    fontSize: 18,
    
  },

  brand: {},
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandLogoImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  brandTitle: {
    fontSize: 24,
    color: '#e5e7eb',
    fontWeight: '700',
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6b7280',
  },

  /* SHIELD */
  shieldSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  shieldOuter: {
    width: 220,
    height: 220,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldMiddle: {
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: 'rgba(4, 29, 60, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInner: {
    width: 165,
    height: 165,
    borderRadius: 82.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInnerInactive: {
    backgroundColor: 'rgba(85, 88, 92, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
   shieldOuterActive: {
    backgroundColor: '#05485d'
  },
  shieldInnerActive: {
    backgroundColor: '#dfd80df7',
  },
  shieldOuterInactive: {
    backgroundColor: 'rgba(34, 34, 30, 0.69)',
  },
  shieldImg: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  guardianLabel: {
    marginTop: 16,
    letterSpacing: 4,
    fontSize: 11,
  },
  guardianLabelInactive: {
    color: '#9ca3af',
  },
  guardianLabelActive: {
    color: '#38bdf8',
  },
  guardianSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#6b7280',
  },

  /* CARDS */
  card: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#020617',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  locationCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconLocationActive: {
    backgroundColor: 'rgba(22,163,74,0.25)',
  },
  cardIconGestureActive: {
    backgroundColor: 'rgba(56,189,248,0.25)',
  },
  cardIconLocationInactive: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cardIconGestureInactive: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cardIconEmoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cardStatusActive: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 2,
  },
  cardStatusInactive: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardSubActive: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  cardSubInactive: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rowLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  rowValue: {
    fontSize: 13,
    color: '#e5e7eb',
  },
  rowValueStrong: {
    fontWeight: '600',
  },
  rowValueAccent: {
    color: '#22c55e',
  },
  rowValueMuted: {
    color: '#4b5563',
  },
  cardInactive: {
    opacity: 0.72,
  },

  gestureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  gestureIndicatorOn: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
  },
  gestureIndicatorOff: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4b5563',
  },

  /* ACTIONS */
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionTile: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  actionCall: {
    backgroundColor: '#7f1d1d',
  },
  actionAlert: {
    backgroundColor: '#78350f',
  },
  actionRoute: {
    backgroundColor: '#0f172a',
  },
  actionContacts: {
    backgroundColor: '#1e1b4b',
  },
  // SOS BOTTOM SHEET
  sosSheet: { 
    position: 'absolute', 
    color : 'white',
    bottom: 0, 
    width: '100%', 
    backgroundColor: 'white', 
    padding: 20, 
    alignItems: 'center', 
    zIndex: 1000,
  },
  sosText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
},
);
