import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../utils/designSystem';

const StatCard = ({ title, value, icon, color = 'blue', onPress, subtitle }) => {
  const getGradientColors = () => {
    // Amader School Aesthetic: Blue & Green Harmony
    const amaderBlue = ['#2563EB', '#1E40AF']; // Royal Blue -> Navy
    const amaderGreen = ['#10B981', '#059669']; // Emerald -> Dark Emerald
    const amaderRed = ['#EF4444', '#DC2626'];   // Red
    const amaderOrange = ['#F59E0B', '#D97706']; // Amber

    const gradients = {
      // Primary Roles -> Royal Blue
      blue: amaderBlue,
      indigo: amaderBlue,
      purple: amaderBlue,
      pink: amaderBlue,
      teal: amaderBlue,
      cyan: amaderBlue,

      // Status Roles -> Green/Red/Orange
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
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm + 1,
    color: colors.white,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default StatCard;
