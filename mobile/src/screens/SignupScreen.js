// src/screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import PrimaryButton from '../components/PrimaryButton';
import { signupUser } from '../services/api';

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
      console.log(
        'Signup error details:',
        error.message,
        error.response?.status,
        error.response?.data
      );
      Alert.alert('Signup failed', 'Check your input or server.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appTitle}>GuardianX</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join GuardianX in under a minute</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton
          title={loading ? 'Creating…' : 'Sign up'}
          onPress={handleSignup}
          style={{ marginTop: SPACING.lg }}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  appTitle: {
    color: COLORS.primary,
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT.body,
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: FONT.caption,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#111623',
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#22283a',
  },
  footer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;
