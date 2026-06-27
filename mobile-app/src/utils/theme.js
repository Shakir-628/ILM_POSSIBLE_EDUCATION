import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Brand colors matching your web app
const brandColors = {
  primary: '#6366F1',      // Indigo
  secondary: '#10B981',    // Emerald
  accent: '#F43F5E',       // Rose
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  info: '#3B82F6',
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
    background: '#F1F5F9',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    border: '#E2E8F0',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    secondary: '#34D399',
    accent: '#FB7185',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#FB7185',
    background: '#020617',
    surface: '#0F172A',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#334155',
  },
  roundness: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const typography = {
  h1: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: '#94A3B8',
  },
};

