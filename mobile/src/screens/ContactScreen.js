// src/screens/ContactsScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { saveContacts, getContacts } from '../services/api';
import { GuardianContext } from '../context/GuardianContext';
import { SPACING, FONT, COLORS } from '../utils/theme';

const ContactsScreen = () => {
  const { user } = useContext(GuardianContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contacts, setContacts] = useState([]);

  // Load saved contacts from backend when screen mounts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (!user?._id) return;
        const res = await getContacts(user._id);
        const backendContacts = res.data.contacts || [];
        setContacts(
          backendContacts.map((c, idx) => ({
            id: `${idx}-${c.phone}`,
            name: c.name,
            phone: c.phone,
          }))
        );
      } catch (err) {
        console.log(
          'Load contacts error:',
          err.response?.data || err.message
        );
      }
    };

    loadContacts();
  }, [user]);

  const addLocalContact = () => {
    if (contacts.length >= 5) {
      Alert.alert('Limit reached', 'You can add at most 5 emergency contacts.');
      return;
    }

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
        contacts: contacts.map(c => ({ name: c.name, phone: c.phone })),
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
      <Text style={styles.inputLabel} />

      <TextInput
        style={styles.input}
        placeholder="Contact name"
        placeholderTextColor="#AAAAAA"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor="#AAAAAA"
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
    backgroundColor: '#121212',
    padding: SPACING.xl,
  },
  title: {
    marginTop: SPACING.xl,
    color: '#FFFFFF',
    fontSize: FONT.subtitle,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: FONT.body,
    marginBottom: SPACING.lg,
  },
  label: {
    marginTop: SPACING.md,
    color: '#FFFFFF',
    fontSize: FONT.caption,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#E0E0E0',
    color: '#000000',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  contactItem: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  contactName: {
    color: '#000000',
    fontSize: FONT.body,
    fontWeight: '600',
  },
  contactPhone: {
    color: '#333333',
    fontSize: FONT.caption,
    marginTop: 2,
  },
  emptyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
