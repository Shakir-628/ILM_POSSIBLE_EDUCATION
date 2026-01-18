import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSystemTheme, setIsSystemTheme] = useState(true);

    // Load theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Listen to system theme changes
    useEffect(() => {
        if (isSystemTheme) {
            const subscription = Appearance.addChangeListener(({ colorScheme }) => {
                setIsDarkMode(colorScheme === 'dark');
            });
            return () => subscription.remove();
        }
    }, [isSystemTheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themePreference');
            const savedIsSystem = await AsyncStorage.getItem('isSystemTheme');

            if (savedIsSystem !== null) {
                const useSystem = savedIsSystem === 'true';
                setIsSystemTheme(useSystem);

                if (useSystem) {
                    const colorScheme = Appearance.getColorScheme();
                    setIsDarkMode(colorScheme === 'dark');
                } else if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                }
            } else {
                // Default to system theme
                const colorScheme = Appearance.getColorScheme();
                setIsDarkMode(colorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            setIsSystemTheme(false);
            await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
            await AsyncStorage.setItem('isSystemTheme', 'false');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const setThemeMode = async (mode) => {
        try {
            if (mode === 'system') {
                setIsSystemTheme(true);
                const colorScheme = Appearance.getColorScheme();
                setIsDarkMode(colorScheme === 'dark');
                await AsyncStorage.setItem('isSystemTheme', 'true');
            } else {
                setIsSystemTheme(false);
                const isDark = mode === 'dark';
                setIsDarkMode(isDark);
                await AsyncStorage.setItem('themePreference', mode);
                await AsyncStorage.setItem('isSystemTheme', 'false');
            }
        } catch (error) {
            console.error('Error setting theme mode:', error);
        }
    };

    const value = {
        isDarkMode,
        isSystemTheme,
        toggleTheme,
        setThemeMode,
        theme: isDarkMode ? 'dark' : 'light',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
