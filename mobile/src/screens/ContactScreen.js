// src/screens/ContactsScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import PrimaryButton from '../components/PrimaryButton';
import { saveContacts } from '../services/api';
import { GuardianContext } from '../context/GuardianContext';

const ContactsScreen = () => {
  const { user } = useContext(GuardianContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contacts, setContacts] = useState([]);

  const addLocalContact = () => {
    if (!name || !phone) {
      Alert.alert('Missing fields', 'Please enter name and phone number.');
      return;
    }
    const newContact = { id: Date.now().toString(), name, phone };
    setContacts(prev => [...prev, newContact]);
    setName('');
    setPhone('');
  };

  const saveAllToBackend = async () => {
    if (!user?._id) {
      Alert.alert('Not logged in', 'User ID missing.');
      return;
    }
    if (contacts.length === 0) {
      Alert.alert('No contacts', 'Add at least one emergency contact.');
      return;
    }

    try {
      await saveContacts(user._id, {
        emergencyContacts: contacts,
      });
      Alert.alert('Saved', 'Emergency contacts stored securely.');
    } catch (error) {
      Alert.alert('Error', 'Could not save contacts.');
      console.log(
        'Contacts save error:',
        error.response?.data || error.message
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.subtitle}>
        People who will be notified when SOS is triggered.
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact name"
        placeholderTextColor={COLORS.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor={COLORS.textSecondary}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <PrimaryButton title="Add to list" onPress={addLocalContact} />

      <FlatList
        style={{ marginTop: SPACING.lg }}
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No contacts added yet.</Text>
        }
      />

      <PrimaryButton
        title="Save contacts"
        onPress={saveAllToBackend}
        style={{ marginTop: SPACING.lg }}
      />
    </View>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
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
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  contactItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  contactName: {
    color: COLORS.textPrimary,
    fontSize: FONT.body,
    fontWeight: '600',
  },
  contactPhone: {
    color: COLORS.textSecondary,
    fontSize: FONT.caption,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
