import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import { GuardianProvider } from './src/context/GuardianContext';



export default function App() {
  return (
    <GuardianProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GuardianProvider>
  );
}
