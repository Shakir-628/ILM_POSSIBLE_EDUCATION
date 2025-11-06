import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Brand colors matching your web app
const brandColors = {
  primary: '#4F46E5',
  secondary: '#8B5CF6',
  accent: '#06b6d4',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
    success: brandColors.success,
    warning: brandColors.warning,
    error: brandColors.danger,
    info: brandColors.info,
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
    success: brandColors.success,
    warning: brandColors.warning,
    error: brandColors.danger,
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
  },
  roundness: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

