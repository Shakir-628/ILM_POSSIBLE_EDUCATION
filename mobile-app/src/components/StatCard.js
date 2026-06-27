import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignSystem } from '../utils/designSystem';

const StatCard = ({ title, value, icon, color = 'blue', onPress, subtitle }) => {
  const { colors, spacing, fontSize, fontWeight, borderRadius, shadows, gradients, isDarkMode } = useDesignSystem();

  const getGradientColors = () => {
    const colorMap = {
      blue: gradients.primary,
      indigo: gradients.parent,
      green: gradients.success,
      red: gradients.error,
      orange: gradients.warning,
      purple: gradients.parent,
    };
    return colorMap[color] || gradients.primary;
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
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255, 255, 255, 0.5)" />
        </View>

        <View style={styles.content}>
          <Text
            style={styles.value}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}
          </Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Decorative Background Icon */}
        <Ionicons
          name={icon}
          size={80}
          color="rgba(255, 255, 255, 0.08)"
          style={styles.bgIcon}
        />
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 8,
  },
  gradient: {
    padding: 18,
    height: 140,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    zIndex: 2,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  bgIcon: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    zIndex: 1,
  },
});

export default StatCard;
