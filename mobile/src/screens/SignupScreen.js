import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import { signupUser } from '../services/api';
import { COLORS, SPACING, FONT } from '../utils/theme';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }
    try {
      setLoading(true);
      await signupUser({ name, email, password });
      setLoading(false);
      Alert.alert('Success', 'Account created. You can login now.');
      navigation.replace('Login');
    } catch (error) {
      setLoading(false);
      console.log('Signup error:', error.response?.data || error.message);
      Alert.alert('Signup failed', 'Check your input or server.');
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.appTitle}>GuardianX</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join GuardianX in under a minute</Text>

          {/* Name Input */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* Email Input */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <PrimaryButton
            title={loading ? 'Creating Account...' : 'Sign Up'}
            onPress={handleSignup}
            style={{ marginTop: SPACING.lg }}
          />

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  appTitle: {
    color: COLORS.primary,
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.body,
    color: '#94a3b8',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT.caption,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#0F172A',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT.body,
    color: '#e5e7eb',
    paddingVertical: SPACING.md,
  },
  footer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT.body,
    color: '#94a3b8',
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default SignupScreen;