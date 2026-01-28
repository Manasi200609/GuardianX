import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ManifestScreen = ({ navigation, route }) => {
  const user = route.params?.user;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1. Fade everything in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();

    // 2. Wait for 2.5 seconds, then go to Dashboard
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        navigation.replace('Dashboard', { user });
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A']} style={StyleSheet.absoluteFill} />
      
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/guardianx-logo.png.jpeg')} 
            style={styles.logoImg} 
          />
        </View>

        <Text style={styles.brandText}>GUARDIAN<Text style={{color: '#38BDF8'}}>X</Text></Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.motto}>Your digital shadow for safety.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  logoContainer: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, elevation: 20, shadowColor: '#38BDF8', shadowOpacity: 0.3, shadowRadius: 20 },
  logoImg: { width: 120, height: 120, borderRadius: 60 },
  brandText: { color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: 3 },
  divider: { width: 40, height: 2, backgroundColor: '#38BDF8', marginVertical: 20, borderRadius: 1 },
  motto: { color: '#94A3B8', fontSize: 16, fontWeight: '500', letterSpacing: 1, fontStyle: 'italic', textAlign: 'center' }
});

export default ManifestScreen;