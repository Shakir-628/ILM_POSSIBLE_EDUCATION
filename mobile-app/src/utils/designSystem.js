/**
 * ILM Possible Education - Mobile App Design System
 * Centralized design tokens for consistent UI across all screens
 */

export const colors = {
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

export const shadows = {
  small: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
};

export const gradients = {
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

