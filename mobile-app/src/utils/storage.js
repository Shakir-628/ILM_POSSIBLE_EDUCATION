import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Save data
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  // Get data
  getItem: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue == null || jsonValue === 'undefined' || jsonValue === 'null') {
        return null;
      }
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Error reading data:', error, 'for key:', key, 'value:', jsonValue);
      return null;
    }
  },

  // Remove data
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  // Clear all data
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  USER: '@user_data',
  THEME: '@theme_preference',
  NOTIFICATIONS: '@notification_settings',
};

