import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignSystem } from '../utils/designSystem';

const StatCard = ({ title, value, icon, color = 'blue', onPress, subtitle }) => {
  const { colors, spacing, fontSize, fontWeight, borderRadius, shadows, isDarkMode } = useDesignSystem();

  const getGradientColors = () => {
    // Amader School Aesthetic: Blue & Green Harmony (Theme Aware)
    const amaderBlue = isDarkMode ? ['#3B82F6', '#1E3A8A'] : ['#2563EB', '#1E40AF'];
    const amaderGreen = isDarkMode ? ['#10B981', '#047857'] : ['#10B981', '#059669'];
    const amaderRed = isDarkMode ? ['#F87171', '#EF4444'] : ['#EF4444', '#DC2626'];
    const amaderOrange = isDarkMode ? ['#FBBF24', '#F59E0B'] : ['#F59E0B', '#D97706'];
    const amaderIndigo = isDarkMode ? ['#818CF8', '#4F46E5'] : ['#6366F1', '#4338CA'];

    const gradients = {
      blue: amaderBlue,
      indigo: amaderIndigo,
      green: amaderGreen,
      red: amaderRed,
      orange: amaderOrange,
      yellow: amaderOrange,
    };
    return gradients[color] || amaderBlue;
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: borderRadius.lg }, shadows.medium]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 12,
  },
  gradient: {
    padding: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default StatCard;
