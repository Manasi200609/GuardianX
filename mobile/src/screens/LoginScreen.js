// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
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
import { loginUser } from '../services/api';
import { GuardianContext } from '../context/GuardianContext';

const LoginScreen = ({ navigation }) => {
  const { setUser } = useContext(GuardianContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      setLoading(false);

      setUser(res.data); // must contain _id
      navigation.replace('Dashboard');
    } catch (error) {
      setLoading(false);
      console.log(
        'Login error details:',
        error.message,
        error.response?.status,
        error.response?.data
      );
      Alert.alert('Login failed', 'Invalid credentials or server issue.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appTitle}>GuardianX</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to continue to GuardianX</Text>

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
          title={loading ? 'Logging in…' : 'Login'}
          onPress={handleLogin}
          style={{ marginTop: SPACING.lg }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            New here? <Text style={styles.footerLink}>Create account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

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
