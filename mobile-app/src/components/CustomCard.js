import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../utils/designSystem';

const CustomCard = ({
  title,
  value,
  icon,
  color = 'blue',
  onPress,
  subtitle,
  children,
  style,
  gradient = false,
}) => {
  const getColorScheme = () => {
    const colors = {
      blue: { bg: '#eff6ff', text: '#1e40af', gradient: ['#3b82f6', '#2563eb'] },
      green: { bg: '#f0fdf4', text: '#15803d', gradient: ['#22c55e', '#16a34a'] },
      purple: { bg: '#faf5ff', text: '#7e22ce', gradient: ['#a855f7', '#9333ea'] },
      red: { bg: '#fef2f2', text: '#b91c1c', gradient: ['#ef4444', '#dc2626'] },
      orange: { bg: '#fff7ed', text: '#c2410c', gradient: ['#f97316', '#ea580c'] },
      indigo: { bg: '#eef2ff', text: '#4f46e5', gradient: ['#6366f1', '#4f46e5'] },
    };
    return colors[color] || colors.blue;
  };

  const colorScheme = getColorScheme();

  if (gradient && title && value !== undefined) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={colorScheme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={32} color="#fff" />
            </View>
          )}
          <Text style={styles.gradientValue}>{value}</Text>
          <Text style={styles.gradientTitle}>{title}</Text>
          {subtitle && <Text style={styles.gradientSubtitle}>{subtitle}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
      mode="elevated"
    >
      <Card.Content>
        {title && value !== undefined ? (
          <View style={styles.statCard}>
            {icon && (
              <View style={[styles.iconCircle, { backgroundColor: colorScheme.bg }]}>
                <Ionicons name={icon} size={24} color={colorScheme.text} />
              </View>
            )}
            <Text style={[styles.value, { color: colorScheme.text }]}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        ) : (
          children
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  gradientCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  gradientValue: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gradientTitle: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  gradientSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
});

export default CustomCard;

