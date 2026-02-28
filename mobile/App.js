// Run bootstrap first to set theme globals before any other module loads
require('./src/bootstrap');

const React = require('react');
const { NavigationContainer } = require('@react-navigation/native');

const AppNavigator = require('./src/navigation/AppNavigator').default;
const { GuardianProvider } = require('./src/context/GuardianContext');

export default function App() {
  return (
    <GuardianProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GuardianProvider>
  );
}
