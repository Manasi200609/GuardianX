import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SOSScreen from '../screens/SOSScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import RouteScreen from '../screens/RouteScreen';
import ContactScreen from '../screens/ContactScreen'; // or ContactScreen with matching export
import SettingsScreen from '../screens/SettingsScreen';
import GestureSelectionScreen from '../screens/GestureSelectionScreen';
import GestureCameraScreen from '../screens/GestureCameraScreen';
import GestureScreen from '../screens/GestureScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Signup"
      component={SignupScreen}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Map" component={MapScreen} 
    options={{ headerShown: false }} />
    <Stack.Screen name="Route" component={RouteScreen} />
    <Stack.Screen name="Contacts" component={ContactScreen} 
    options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} 
    options={{ headerShown: false }}  />
    <Stack.Screen name="SOS" component={SOSScreen} />
    <Stack.Screen name="GestureSelection"component={GestureSelectionScreen}
    options={{ headerShown: false }} />
     <Stack.Screen name ="GestureCamera" component={GestureCameraScreen}/>
    <Stack.Screen name="Gesture" component={GestureScreen}
    options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default AppNavigator;
