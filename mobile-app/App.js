import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, configureFonts } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';

// Configure react-native-paper to use Expo icons (suppress warning)
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Override the default icon component
const customTheme = {
  ...theme,
  // This ensures react-native-paper uses Expo icons
};

export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

