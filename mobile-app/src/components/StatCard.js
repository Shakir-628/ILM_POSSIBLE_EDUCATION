import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../utils/designSystem';

const StatCard = ({ title, value, icon, color = 'blue', onPress, subtitle }) => {
  const getGradientColors = () => {
    const gradients = {
      blue: ['#3b82f6', '#2563eb'],
      green: ['#22c55e', '#16a34a'],
      purple: ['#a855f7', '#9333ea'],
      red: ['#ef4444', '#dc2626'],
      orange: ['#f97316', '#ea580c'],
      indigo: ['#6366f1', '#4f46e5'],
      yellow: ['#eab308', '#ca8a04'],
    };
    return gradients[color] || gradients.blue;
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

