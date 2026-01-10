// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogle = () => {
    // TODO: Google sign-in
  };

  const handleSignIn = () => {
    // TODO: call your login API, then:
    navigation.replace('Dashboard');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        {/* Logo circle */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/guardianx-logo.png.jpeg')}
            style={styles.logoImg}
          />
        </View>

        <Text style={styles.title}>Welcome to GuardianX</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Google button */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
          <View style={styles.googleIconBox}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Sign in */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn}>
          <Text style={styles.primaryBtnText}>Sign in</Text>
        </TouchableOpacity>

        {/* Extra links */}
        <TouchableOpacity style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>Forgot password?</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Need an account?{' '}
          <Text style={styles.footerLink} onPress={handleSignup}>
            Sign up
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#e5f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingTop: 52,
    paddingHorizontal: 26,
    paddingBottom: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 22 },
    elevation: 8,
    position: 'relative',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: -35,
    left: '50%',
    marginLeft: -35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
    overflow: 'hidden',
  },
  logoImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 20,
  },

  // Google button
  googleBtn: {
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  googleIconBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleIconText: {
    fontWeight: '600',
    color: '#4285f4',
    fontSize: 14,
  },
  googleBtnText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#111827',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 11,
    color: '#9ca3af',
    letterSpacing: 2,
  },

  // Inputs
  label: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 10,
  },

  // Primary button
  primaryBtn: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#020617',
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryBtnText: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '600',
  },

  // Links
  linkBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkBtnText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
    color: '#6b7280',
  },
  footerLink: {
    color: '#020617',
    fontWeight: '600',
  },
});