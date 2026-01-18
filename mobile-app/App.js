import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, configureFonts } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { SocketProvider } from './src/context/SocketContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { theme } from './src/utils/theme';

// Configure react-native-paper to use Expo icons (suppress warning)
import { MaterialCommunityIcons } from '@expo/vector-icons';

import linking from './src/navigation/linking';

// Override the default icon component
const customTheme = {
  ...theme,
  // This ensures react-native-paper uses Expo icons
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Hide splash screen after animation completes
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ThemeProvider>
      <PaperProvider theme={customTheme}>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <NavigationContainer linking={linking}>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}

