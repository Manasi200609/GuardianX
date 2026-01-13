// src/screens/SOSScreen.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { GuardianContext } from '../context/GuardianContext';

const SOSScreen = ({ route }) => {
  const { sendSOS, isActive } = useContext(GuardianContext);
  const lat = route?.params?.lat;
  const lng = route?.params?.lng;

  const handleAlertSOS = async () => {
    if (!isActive) {
      Alert.alert('Guardian Mode Off', 'Please activate Guardian Mode first.');
      return;
    }

    await sendSOS(
      lat && lng
        ? { latitude: lat, longitude: lng }
        : null
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Screen</Text>
      <Button title="Send SOS Alert" onPress={handleAlertSOS} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});

export default SOSScreen;
