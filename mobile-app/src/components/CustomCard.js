import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignSystem, spacing, borderRadius, fontSize, fontWeight } from '../utils/designSystem';

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
  glass = false,
}) => {
  const { colors, spacing, fontSize, fontWeight, borderRadius, shadows, isDarkMode } = useDesignSystem();

  const getColorScheme = () => {
    if (isDarkMode) {
      const darkColors = {
        blue: { bg: '#1e3a8a33', text: '#60a5fa', gradient: ['#1e40af', '#1d4ed8'] },
        green: { bg: '#064e3b33', text: '#34d399', gradient: ['#059669', '#10b981'] },
        purple: { bg: '#581c8733', text: '#c084fc', gradient: ['#7e22ce', '#9333ea'] },
        red: { bg: '#7f1d1d33', text: '#f87171', gradient: ['#dc2626', '#ef4444'] },
        orange: { bg: '#7c2d1233', text: '#fbbf24', gradient: ['#d97706', '#f59e0b'] },
        indigo: { bg: '#312e8133', text: '#818cf8', gradient: ['#4f46e5', '#6366f1'] },
      };
      return darkColors[color] || darkColors.blue;
    }

    const lightColors = {
      blue: { bg: '#eff6ff', text: '#1e40af', gradient: ['#3b82f6', '#2563eb'] },
      green: { bg: '#f0fdf4', text: '#15803d', gradient: ['#22c55e', '#16a34a'] },
      purple: { bg: '#faf5ff', text: '#7e22ce', gradient: ['#a855f7', '#9333ea'] },
      red: { bg: '#fef2f2', text: '#b91c1c', gradient: ['#ef4444', '#dc2626'] },
      orange: { bg: '#fff7ed', text: '#c2410c', gradient: ['#f97316', '#ea580c'] },
      indigo: { bg: '#eef2ff', text: '#4f46e5', gradient: ['#6366f1', '#4f46e5'] },
    };
    return lightColors[color] || lightColors.blue;
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
          style={[styles.gradientCard, { borderRadius: borderRadius.md }]}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={32} color="#fff" />
            </View>
          )}
          <Text style={[styles.gradientValue, { fontSize: fontSize.hero }]}>{value}</Text>
          <Text style={[styles.gradientTitle, { fontSize: fontSize.base }]}>{title}</Text>
          {subtitle && <Text style={[styles.gradientSubtitle, { fontSize: fontSize.sm }]}>{subtitle}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const cardStyle = [
    styles.card,
    {
      backgroundColor: glass ? (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)') : colors.cardBackground,
      borderRadius: borderRadius.md,
      borderColor: glass ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') : 'transparent',
      borderWidth: glass ? 1 : 0,
    },
    !glass && shadows.small,
    style
  ];

  return (
    <Card
      style={cardStyle}
      onPress={onPress}
      mode={glass ? "contained" : "elevated"}
      elevation={glass ? 0 : 2}
    >
      <Card.Content>
        {title && value !== undefined ? (
          <View style={styles.statCard}>
            {icon && (
              <View style={[styles.iconCircle, { backgroundColor: colorScheme.bg }]}>
                <Ionicons name={icon} size={24} color={colorScheme.text} />
              </View>
            )}
            <Text style={[styles.value, { color: colorScheme.text, fontSize: fontSize.display }]}>{value}</Text>
            <Text style={[styles.title, { color: colors.textSecondary, fontSize: fontSize.base }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: colors.textTertiary, fontSize: fontSize.sm }]}>{subtitle}</Text>}
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
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: spacing.xl,
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
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  gradientValue: {
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  gradientTitle: {
    color: '#FFFFFF',
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  gradientSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
});

export default CustomCard;

