import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LogoutButton = ({ color = '#fff', size = 24 }) => {
  const { logout } = useAuth();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    // Show confirmation dialog
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: performLogout, style: 'destructive' },
        ],
        { cancelable: true }
      );
    }
  };

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      
      // On web, reload the page to clear state
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      setLoggingOut(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={loggingOut}
      style={styles.button}
    >
      <Ionicons 
        name="log-out-outline" 
        size={size} 
        color={loggingOut ? 'rgba(255,255,255,0.5)' : color} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default LogoutButton;

