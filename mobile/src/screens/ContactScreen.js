// src/screens/ContactScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import { saveContacts, getContacts } from '../services/api';
import { GuardianContext } from '../context/GuardianContext';
import { SPACING, FONT, COLORS } from '../utils/theme';

const ContactsScreen = ({ navigation }) => {
  const { user, isActive } = useContext(GuardianContext);

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

  const removeContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
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

  const gradientColors = isActive
    ? ['#0F172A', '#1E293B', '#0F172A']
    : ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

  const textColor = isActive ? '#e5e7eb' : COLORS.text;
  const subtextColor = isActive ? '#94a3b8' : COLORS.textSecondary;
  const inputBgColor = isActive ? '#1E293B' : '#E0E0E0';
  const inputTextColor = isActive ? '#e5e7eb' : '#000000';
  const cardBgColor = isActive ? '#1E293B' : '#E0E0E0';
  const borderColor = isActive ? '#334155' : 'transparent';

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar 
        barStyle={isActive ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Emergency Contacts</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          People who will be notified when SOS is triggered.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: textColor }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }]}
          placeholder="Contact name"
          placeholderTextColor={isActive ? '#64748b' : '#AAAAAA'}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: textColor }]}>Phone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBgColor, color: inputTextColor, borderColor: borderColor }]}
          placeholder="Phone number"
          placeholderTextColor={isActive ? '#64748b' : '#AAAAAA'}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <PrimaryButton 
          title="Add to list" 
          onPress={addLocalContact}
          style={{ marginTop: SPACING.md }}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: textColor }]}>
          Added Contacts ({contacts.length}/5)
        </Text>
        
        {contacts.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={contacts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.contactItem, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactName, { color: textColor }]}>{item.name}</Text>
                  <Text style={[styles.contactPhone, { color: subtextColor }]}>{item.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => removeContact(item.id)}>
                  <Text style={styles.removeBtn}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <Text style={[styles.emptyText, { color: subtextColor }]}>No contacts added yet.</Text>
        )}
      </View>

      <PrimaryButton
        title="Save All Contacts"
        onPress={saveAllToBackend}
        style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.xl }}
      />
    </LinearGradient>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    fontSize: FONT.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.body,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    flex: 1,
    marginBottom: SPACING.lg,
  },
  listTitle: {
    fontSize: FONT.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  contactItem: {
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  contactName: {
    fontSize: FONT.body,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: FONT.caption,
    marginTop: 4,
  },
  removeBtn: {
    fontSize: 24,
    color: '#ef4444',
    fontWeight: 'bold',
    paddingHorizontal: SPACING.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});