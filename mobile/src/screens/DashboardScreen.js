import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated, 
  Easing, 
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import { GuardianContext } from '../context/GuardianContext';
import emergencyFlowService from '../services/emergencyFlow';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ route }) => {
  const navigation = useNavigation();
  const { isActive, toggleGuardian, setSosScreenNavigation } = useContext(GuardianContext);
  const [location, setLocation] = useState(null);
  const user = route?.params?.user || null;

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    setSosScreenNavigation(navigation);
  }, []);

  useEffect(() => {
    if (isActive) {
      startLocationTracking();
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isActive]);

  const startLocationTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    }
  };

  const isDark = isActive;
  const bgColors = isDark ? ['#020617', '#0F172A', '#020617'] : ['#F8FAFC', '#F1F5F9', '#E2E8F0'];
  const surfaceColor = isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.2)';
  const mainText = isDark ? '#F8FAFC' : '#1E293B';
  const subText = isDark ? '#94A3B8' : '#64748B';
  const accentColor = '#14B8A6';

  return (
    <LinearGradient colors={bgColors} style={styles.app}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      
      {/* BACKGROUND ELEMENTS */}
      {isDark ? (
        <Image source={require('../../assets/map.jpg')} style={styles.mapBackground} />
      ) : (
        <View style={styles.bgContainer}>
          {/* Centered Watermark */}
          <View style={styles.watermarkContainer}>
            <Image 
              source={require('../../assets/s1.png')} 
              style={styles.shieldWatermark} 
            />
          </View>
          <View style={styles.centerDepthGlow} />
        </View>
      )}

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        
        {/* HEADER - Shifted lower */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brandTitle, { color: mainText }]}>GUARDIAN<Text style={{color: accentColor}}>X</Text></Text>
            <Text style={[styles.brandSubtitle, { color: subText }]}>SYSTEM STATUS: {isActive ? 'ARMED' : 'STANDBY'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.menuBtn, { backgroundColor: surfaceColor, borderColor }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image source={require('../../assets/menu.png')} style={[styles.menuIcon, { tintColor: mainText }]} />
          </TouchableOpacity>
        </View>

        {/* SHIELD CORE */}
        <View style={styles.shieldWrapper}>
          <TouchableOpacity 
            onPress={() => {
              toggleGuardian();
              if (!isActive) setTimeout(() => navigation.navigate('GuardianMode'), 400);
            }} 
            activeOpacity={0.85}
          >
            <View style={styles.shieldCore}>
              {isActive && (
                <>
                  <Animated.View style={[styles.pulse, {
                    transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
                    opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
                  }]} />
                  <View style={[styles.staticGlowRing, { borderColor: 'rgba(20, 184, 166, 0.2)' }]} />
                </>
              )}
              
              <View style={[
                styles.shieldOuter, 
                { 
                  borderColor: isActive ? '#14B8A6' : '#CBD5E1', 
                  backgroundColor: isActive ? '#020617' : surfaceColor,
                  borderWidth: isActive ? 4 : 1.5,
                  elevation: isActive ? 15 : 4,
                }
              ]}>
                <View style={[
                  styles.innerBezel, 
                  { backgroundColor: isActive ? 'rgba(20, 184, 166, 0.05)' : 'transparent' }
                ]}>
                  <Image 
                    source={isActive ? require('../../assets/s2.png') : require('../../assets/s1.png')} 
                    style={[
                      styles.shieldImg, 
                      !isActive && { tintColor: '#94A3B8', opacity: 0.6 }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[styles.statusText, { color: isActive ? '#14B8A6' : subText }]}>
            {isActive ? 'SHIELD ACTIVE' : 'SYSTEM DISARMED'}
          </Text>
        </View>

        {/* SYSTEM CARDS */}
        <View style={styles.cardContainer}>
          <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: isActive ? 'rgba(20, 184, 166, 0.1)' : '#F1F5F9' }]}>
                <Text style={styles.emojiIcon}>{isActive ? '✋' : '⬚'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: mainText }]}>Hand Gesture Engine</Text>
                <Text style={[styles.cardSub, { color: subText }]}>
                  {isActive ? 'MediaPipe: Tracking Active' : 'Gesture Logic: Paused'}
                </Text>
              </View>
              {isActive && <View style={styles.liveIndicator} />}
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Map')}
            style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : '#F1F5F9' }]}>
                <Text style={styles.emojiIcon}>📍</Text>
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: mainText }]}>Digital Shadow</Text>
                <Text style={[styles.cardSub, { color: subText }]}>
                  {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'GPS Standby'}
                </Text>
              </View>
            </View> 
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actionGrid}>
          {[
            { label: 'Call 112', icon: '📞', action: () => Alert.alert('Emergency', 'Dialing...') },
            { label: 'SOS Alert', icon: '⚠️', action: () => {} },
            { label: 'Safe Route', icon: '🗺️', action: () => {} },
            { label: 'Contacts', icon: '👥', action: () => {} },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              onPress={item.action}
              style={[styles.actionBtn, { backgroundColor: surfaceColor, borderColor }]}
            >
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={[styles.actionLabel, { color: mainText }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  app: { flex: 1 },
  // Increased PaddingTop to lower the header
  mainContent: { flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 85 : 70 },
  mapBackground: { ...StyleSheet.absoluteFillObject, width: width, height: height, opacity: 0.15 },
  
  bgContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  watermarkContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  shieldWatermark: { width: width * 0.7, height: width * 0.7, opacity: 0.04, tintColor: '#64748B', resizeMode: 'contain' },
  centerDepthGlow: { position: 'absolute', width: width * 0.8, height: width * 0.8, borderRadius: width, backgroundColor: '#FFFFFF', opacity: 0.4, shadowColor: '#94A3B8', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.1, shadowRadius: 50 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  brandTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  brandSubtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  menuBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  menuIcon: { width: 22, height: 22 },
  
  shieldWrapper: { alignItems: 'center', marginVertical: 15 },
  shieldCore: { width: 240, height: 240, justifyContent: 'center', alignItems: 'center' },
  pulse: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#14B8A6' },
  staticGlowRing: { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 1 },
  shieldOuter: { 
    width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10
  },
  innerBezel: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  shieldImg: { width: 75, height: 75, resizeMode: 'contain' },
  statusText: { marginTop: 15, fontSize: 12, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },

  cardContainer: { gap: 16, marginBottom: 25 },
  card: { 
    padding: 20, borderRadius: 24, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  emojiIcon: { fontSize: 20 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  actionBtn: { 
    width: (width - 60) / 2, paddingVertical: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1
  },
  actionIcon: { fontSize: 22, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700' }
});

export default DashboardScreen;