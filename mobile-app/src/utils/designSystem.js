/**
 * ILM Possible Education - Mobile App Design System
 * Centralized design tokens for consistent UI across all screens
 */

// Light Theme Colors - Premium Palette
const lightColors = {
  // Brand Colors - Modern Indigo & Emerald Harmony
  primary: '#6366F1',      // Indigo - Innovation
  primaryDark: '#4F46E5',  // Deep Indigo - Stability
  primaryLight: '#818CF8', // Soft Indigo - Approachable
  
  secondary: '#10B981',    // Emerald - Growth
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  accent: '#F43F5E',       // Rose - Interactive/Action
  accentLight: '#FB7185',

  // Semantic Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#F43F5E',
  errorLight: '#FFE4E6',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Status Colors
  active: '#10B981',
  inactive: '#94A3B8',
  pending: '#F59E0B',
  paid: '#10B981',
  unpaid: '#F43F5E',
  overdue: '#F43F5E',

  // Neutral Colors - Slate Scale
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

  // Background & Surface
  background: '#F1F5F9',   // Slightly deeper for better card contrast
  cardBackground: '#FFFFFF',
  glassBackground: 'rgba(255, 255, 255, 0.7)',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textLight: '#FFFFFF',

  // Role Colors
  admin: '#6366F1',
  teacher: '#10B981',
  student: '#3B82F6',
  parent: '#8B5CF6',
};

// Dark Theme Colors - Deep Space Palette
const darkColors = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#A5B4FC',

  secondary: '#34D399',
  secondaryDark: '#10B981',
  secondaryLight: '#6EE7B7',

  accent: '#FB7185',
  accentLight: '#FDA4AF',

  // Semantic
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.2)',
  error: '#FB7185',
  errorLight: 'rgba(251, 113, 133, 0.2)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.2)',
  info: '#60A5FA',
  infoLight: 'rgba(96, 165, 250, 0.2)',

  // Status
  active: '#34D399',
  inactive: '#475569',
  pending: '#FBBF24',
  paid: '#34D399',
  unpaid: '#FB7185',
  overdue: '#FB7185',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#0F172A',
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
  background: '#020617',   // Deeper black-blue
  cardBackground: '#0F172A',
  glassBackground: 'rgba(15, 23, 42, 0.7)',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  textLight: '#FFFFFF',

  // Role
  admin: '#818CF8',
  teacher: '#34D399',
  student: '#60A5FA',
  parent: '#A78BFA',
};

import { useTheme } from '../context/ThemeContext';

// Function to get colors based on theme
export const getColors = (isDarkMode = false) => {
  return isDarkMode ? darkColors : lightColors;
};

const lightGradients = {
  // Premium Modern Gradients
  primary: ['#6366F1', '#4F46E5'], // Indigo -> Deep Indigo
  secondary: ['#10B981', '#059669'], // Emerald -> Dark Emerald
  accent: ['#F43F5E', '#E11D48'], // Rose -> Crimson
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#F43F5E', '#E11D48'],
  info: ['#3B82F6', '#2563EB'],
  card: ['#FFFFFF', '#F8FAFC'],
  glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],

  // Role Gradients
  admin: ['#6366F1', '#4F46E5'],
  teacher: ['#10B981', '#059669'],
  student: ['#3B82F6', '#2563EB'],
  parent: ['#8B5CF6', '#7C3AED'],
};

const darkGradients = {
  primary: ['#818CF8', '#6366F1'],
  secondary: ['#34D399', '#10B981'],
  accent: ['#FB7185', '#F43F5E'],
  success: ['#34D399', '#10B981'],
  warning: ['#FBBF24', '#F59E0B'],
  error: ['#FB7185', '#F43F5E'],
  info: ['#60A5FA', '#3B82F6'],
  card: ['#0F172A', '#020617'],
  glass: ['rgba(15, 23, 42, 0.8)', 'rgba(15, 23, 42, 0.4)'],

  // Role Gradients
  admin: ['#818CF8', '#6366F1'],
  teacher: ['#34D399', '#10B981'],
  student: ['#60A5FA', '#3B82F6'],
  parent: ['#A78BFA', '#8B5CF6'],
};

// Function to get gradients based on theme
export const getGradients = (isDarkMode = false) => {
  return isDarkMode ? darkGradients : lightGradients;
};

export const getShadows = (isDarkMode = false) => ({
  small: {
    shadowColor: isDarkMode ? '#000000' : '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.4 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: isDarkMode ? '#000000' : '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.5 : 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  large: {
    shadowColor: isDarkMode ? '#000000' : '#4F46E5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: isDarkMode ? 0.6 : 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  inner: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0,
  }
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
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 17,
  lg: 19,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  display: 42,
  hero: 48,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Common component styles
export const componentStyles = {
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  glassCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },

  input: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    color: colors.textPrimary,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },

  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },

  header: {
    padding: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  section: {
    padding: spacing.xl,
  },

  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
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
