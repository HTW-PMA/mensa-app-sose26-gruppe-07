import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppProvider';
import { TabNavigator } from './src/navigation/TabNavigator';
import { configureNotificationHandling } from './src/services/notificationService';

configureNotificationHandling();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
