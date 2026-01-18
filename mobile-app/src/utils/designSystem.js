/**
 * ILM Possible Education - Mobile App Design System
 * Centralized design tokens for consistent UI across all screens
 */

// Light Theme Colors
const lightColors = {
  // Brand Colors - Amader School Style (Blue & Green Harmony)
  primary: '#2563EB',      // Royal Blue - Trust
  primaryDark: '#1E40AF',  // Navy - Stability
  primaryLight: '#60A5FA', // Sky - Openness

  // Secondary is now Green to match the aesthetic description
  secondary: '#10B981',    // Emerald - Growth/Freshness
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  // Semantic Colors
  success: '#10B981',      // Emerald Green
  successLight: '#6EE7B7',
  error: '#EF4444',        // Red
  errorLight: '#FCA5A5',
  warning: '#F59E0B',      // Amber/Orange
  warningLight: '#FCD34D',
  info: '#3B82F6',         // Blue
  infoLight: '#93C5FD',

  // Status Colors
  active: '#10B981',
  inactive: '#EF4444',
  pending: '#F59E0B',
  paid: '#10B981',
  unpaid: '#EF4444',
  overdue: '#EF4444',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Background
  background: '#F8FAFC', // Crisp Light Grey
  cardBackground: '#FFFFFF',

  // Text
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textTertiary: '#94A3B8',  // Slate 400
  textLight: '#FFFFFF',

  // Priority Colors
  urgent: '#EF4444',
  high: '#F59E0B',
  medium: '#2563EB',
  low: '#10B981',

  // Role Colors - Unified Blue/Green Theme
  admin: '#2563EB',    // Blue
  teacher: '#10B981',  // Green (Growth)
  student: '#2563EB',  // Blue
  parent: '#10B981',   // Green
};

// Dark Theme Colors
const darkColors = {
  // Brand Colors - Adjusted for dark mode
  primary: '#3B82F6',      // Brighter Blue for visibility
  primaryDark: '#1E3A8A',  // Darker Navy
  primaryLight: '#60A5FA',

  secondary: '#10B981',    // Emerald stays vibrant
  secondaryDark: '#047857',
  secondaryLight: '#34D399',

  // Semantic Colors
  success: '#10B981',
  successLight: '#6EE7B7',
  error: '#F87171',        // Softer red
  errorLight: '#FCA5A5',
  warning: '#FBBF24',      // Brighter amber
  warningLight: '#FCD34D',
  info: '#60A5FA',
  infoLight: '#93C5FD',

  // Status Colors
  active: '#10B981',
  inactive: '#F87171',
  pending: '#FBBF24',
  paid: '#10B981',
  unpaid: '#F87171',
  overdue: '#F87171',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#0F172A',       // Inverted
  gray100: '#1E293B',
  gray200: '#334155',
  gray300: '#475569',
  gray400: '#64748B',
  gray500: '#94A3B8',
  gray600: '#CBD5E1',
  gray700: '#E2E8F0',
  gray800: '#F1F5F9',
  gray900: '#F8FAFC',

  // Background
  background: '#0F172A',   // Dark slate
  cardBackground: '#1E293B', // Slightly lighter

  // Text
  textPrimary: '#F8FAFC',   // Light for readability
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  textLight: '#FFFFFF',

  // Priority Colors
  urgent: '#F87171',
  high: '#FBBF24',
  medium: '#3B82F6',
  low: '#10B981',

  // Role Colors
  admin: '#3B82F6',
  teacher: '#10B981',
  student: '#3B82F6',
  parent: '#10B981',
};

import { useTheme } from '../context/ThemeContext';

// Function to get colors based on theme
export const getColors = (isDarkMode = false) => {
  return isDarkMode ? darkColors : lightColors;
};

const lightGradients = {
  // Amader School Style Gradients (Blue & Green dominant)
  primary: ['#2563EB', '#1E40AF'], // Royal Blue -> Navy
  secondary: ['#10B981', '#059669'], // Emerald -> Dark Emerald
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
  card: ['#FFFFFF', '#F8FAFC'],

  // Role Gradients
  admin: ['#2563EB', '#1E40AF'],
  teacher: ['#10B981', '#059669'],
  student: ['#3B82F6', '#2563EB'],
  parent: ['#10B981', '#059669'],
};

const darkGradients = {
  primary: ['#3B82F6', '#1E3A8A'], // Brighter blue for dark mode
  secondary: ['#10B981', '#047857'],
  success: ['#10B981', '#047857'],
  warning: ['#FBBF24', '#F59E0B'],
  error: ['#F87171', '#EF4444'],
  info: ['#60A5FA', '#3B82F6'],
  card: ['#1E293B', '#0F172A'],

  // Role Gradients
  admin: ['#3B82F6', '#1E3A8A'],
  teacher: ['#10B981', '#047857'],
  student: ['#60A5FA', '#3B82F6'],
  parent: ['#10B981', '#047857'],
};

// Function to get gradients based on theme
export const getGradients = (isDarkMode = false) => {
  return isDarkMode ? darkGradients : lightGradients;
};

export const getShadows = (isDarkMode = false) => ({
  small: {
    shadowColor: isDarkMode ? '#000000' : '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: isDarkMode ? '#000000' : '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.4 : 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: isDarkMode ? '#000000' : '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.5 : 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
});

export const useDesignSystem = () => {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const gradients = getGradients(isDarkMode);
  const shadows = getShadows(isDarkMode);

  return {
    colors,
    gradients,
    shadows,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    isDarkMode
  };
};

// Default export for backward compatibility
export const colors = lightColors;
export const gradients = lightGradients;
export const shadows = getShadows(false);

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  hero: 40,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Common component styles
export const componentStyles = {
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.medium,
  },

  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },

  header: {
    padding: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  section: {
    padding: spacing.lg,
  },

  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
};

// Helper functions
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return colors.active;
    case 'inactive': return colors.inactive;
    case 'pending': return colors.pending;
    case 'paid': return colors.success;
    case 'unpaid': return colors.error;
    case 'overdue': return colors.error;
    default: return colors.gray500;
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'urgent': return colors.urgent;
    case 'high': return colors.high;
    case 'medium': return colors.medium;
    case 'low': return colors.low;
    default: return colors.gray500;
  }
};

export const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'superadmin': return colors.admin;
    case 'teacher': return colors.teacher;
    case 'student': return colors.student;
    case 'parent': return colors.parent;
    default: return colors.primary;
  }
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  gradients,
  componentStyles,
  getStatusColor,
  getPriorityColor,
  getRoleColor,
};
