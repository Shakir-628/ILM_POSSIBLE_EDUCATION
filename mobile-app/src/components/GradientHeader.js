import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';

/**
 * Reusable gradient header component
 * @param {string} title - Main title
 * @param {string} subtitle - Subtitle text
 * @param {string} userName - User name to display
 * @param {boolean} showLogout - Show logout button
 * @param {boolean} showBack - Show back button
 * @param {function} onBack - Back button callback
 * @param {array} colors - Gradient colors (default: purple gradient)
 */
const GradientHeader = ({ 
  title, 
  subtitle, 
  userName,
  showLogout = false,
  showBack = false,
  onBack,
  colors = ['#4F46E5', '#8B5CF6']
}) => {
  return (
    <LinearGradient colors={colors} style={styles.header}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      <View style={styles.content}>
        <View style={styles.info}>
          {title && <Text style={styles.title}>{title}</Text>}
          {userName && <Text style={styles.userName}>{userName}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showLogout && <LogoutButton />}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default GradientHeader;

