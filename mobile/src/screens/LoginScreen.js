import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// using heroicons for consistent look
import { UserIcon, LockClosedIcon, ArrowRightIcon } from 'react-native-heroicons/outline';
import { GuardianContext } from '../context/GuardianContext';
import { loginUser } from '../services/api';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(GuardianContext);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Background sweep logic
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: height, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: -height, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    try {
      setLoading(true);
      const user = await loginUser({ email, password });
      setUser(user);
      // Moving to the Motto/Manifest screen next
      navigation.replace('Manifest', { user });
    } catch (error) {
      setLoading(false);
      Alert.alert('Login failed', 'Check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. TACTICAL HEX BACKGROUND */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      <Image 
        source={require('../../assets/tactical_hex.jpg')} 
        style={styles.fullScreenBackground}
        resizeMode="cover"
      />
      <LinearGradient 
        colors={['rgba(2, 6, 23, 0.8)', 'rgba(2, 6, 23, 0.95)']} 
        style={StyleSheet.absoluteFill} 
      />

      {/* 2. SCANNING LINE */}
      {loading && (
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]}>
          <LinearGradient colors={['transparent', 'rgba(56, 189, 248, 0.3)', 'transparent']} style={{flex: 1}} />
        </Animated.View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.centeringWrapper}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
               <Image source={require('../../assets/guardianx-logo.png.jpeg')} style={styles.logoImg} />
               <View style={styles.logoRing} />
            </View>
            <Text style={styles.brand}>GUARDIAN<Text style={{color: '#38BDF8'}}>X</Text></Text>
            <Text style={styles.tagline}>H U M A N  S A F E T Y  N E T W O R K</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <UserIcon color="rgba(56, 189, 248, 0.4)" size={18} style={styles.inputIcon} />
              <TextInput 
                placeholder="you@example.com" 
                placeholderTextColor="rgba(148, 163, 184, 0.3)"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <LockClosedIcon color="rgba(56, 189, 248, 0.4)" size={18} style={styles.inputIcon} />
              <TextInput 
                placeholder="••••••••" 
                placeholderTextColor="rgba(148, 163, 184, 0.3)"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupText}>Need an account? Sign up</Text>
                <ArrowRightIcon color="#38BDF8" size={14} style={{marginLeft: 8}} />
            </TouchableOpacity>
          </View>

          <Text style={styles.footerInfo}>STABLE v4.2.0 | ENCRYPTED LINK ACTIVE</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullScreenBackground: { position: 'absolute', width: width, height: height, opacity: 0.25 },
  scanLine: { position: 'absolute', width: '100%', height: 200, zIndex: 5 },
  centeringWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { width: width > 450 ? 400 : '86%', zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoImg: { width: 70, height: 70, borderRadius: 35 },
  logoRing: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', borderRadius: 24, transform: [{ rotate: '45deg' }] },
  brand: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  tagline: { color: '#64748B', fontSize: 9, letterSpacing: 4, marginTop: 8, fontWeight: '700' },
  glassCard: { backgroundColor: 'rgba(15, 23, 42, 0.92)', padding: 32, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  label: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)', marginBottom: 15 },
  inputIcon: { marginLeft: 15 },
  input: { flex: 1, padding: 16, color: '#F8FAFC', fontSize: 15 },
  primaryBtn: { backgroundColor: '#38BDF8', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#020617', fontWeight: '900', letterSpacing: 1 },
  signupBtn: { marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  signupText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  footerInfo: { marginTop: 40, color: 'rgba(148, 163, 184, 0.2)', fontSize: 9, textAlign: 'center' }
});

export default LoginScreen;