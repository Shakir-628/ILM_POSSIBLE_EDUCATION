# Dark Mode Implementation Guide

## Overview
A comprehensive dark mode system has been implemented for the ILM Possible Education mobile app. The system supports three modes:
- **Light Mode**: Traditional light theme
- **Dark Mode**: Dark theme optimized for low-light environments
- **System Mode**: Automatically follows device system settings

## Architecture

### 1. ThemeContext (`src/context/ThemeContext.js`)
- Manages global theme state
- Persists user preference using AsyncStorage
- Listens to system theme changes
- Provides `useTheme()` hook for components

**Key Methods:**
- `toggleTheme()`: Switches between light and dark
- `setThemeMode(mode)`: Sets specific mode ('light', 'dark', 'system')
- `isDarkMode`: Boolean indicating current theme
- `isSystemTheme`: Boolean indicating if using system preference

### 2. Design System Updates (`src/utils/designSystem.js`)
- Separate color palettes for light and dark themes
- Theme-aware gradients and shadows
- Maintains Blue & Green "Amader School" aesthetic in both themes

**New Functions:**
- `getColors(isDarkMode)`: Returns theme-specific color palette
- `getGradients(isDarkMode)`: Returns theme-specific gradients
- `getShadows(isDarkMode)`: Returns theme-specific shadows

### 3. useThemedStyles Hook (`src/utils/useThemedStyles.js`)
Custom hook that provides theme-aware design tokens:
```javascript
const { colors, gradients, shadows, isDarkMode } = useThemedStyles();
```

## Usage in Components

### Basic Usage
```javascript
import useThemedStyles from '../../utils/useThemedStyles';

const MyComponent = () => {
  const { colors, gradients, shadows } = useThemedStyles();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.textPrimary }}>Hello</Text>
    </View>
  );
};
```

### With Theme Toggle
```javascript
import { useTheme } from '../../context/ThemeContext';

const MyComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>Current: {isDarkMode ? 'Dark' : 'Light'}</Text>
    </TouchableOpacity>
  );
};
```

## Color Palette

### Light Theme
- **Background**: `#F8FAFC` (Light Gray)
- **Card Background**: `#FFFFFF` (White)
- **Text Primary**: `#0F172A` (Dark Slate)
- **Text Secondary**: `#475569` (Slate)
- **Primary**: `#2563EB` (Royal Blue)
- **Secondary**: `#10B981` (Emerald Green)

### Dark Theme
- **Background**: `#0F172A` (Dark Slate)
- **Card Background**: `#1E293B` (Lighter Slate)
- **Text Primary**: `#F8FAFC` (Light)
- **Text Secondary**: `#CBD5E1` (Light Slate)
- **Primary**: `#3B82F6` (Brighter Blue)
- **Secondary**: `#10B981` (Emerald Green - same)

## Settings Integration

The Settings screen (`src/screens/admin/SettingsScreen.js`) provides a user-friendly interface to:
1. Choose between Light, Dark, or System theme
2. Visual indicators showing current selection
3. Instant theme switching with smooth transitions

## Migration Guide for Existing Components

### Step 1: Import the hook
```javascript
import useThemedStyles from '../../utils/useThemedStyles';
```

### Step 2: Get theme-aware tokens
```javascript
const { colors, gradients, shadows } = useThemedStyles();
```

### Step 3: Update hardcoded colors
**Before:**
```javascript
<View style={{ backgroundColor: '#FFFFFF' }}>
  <Text style={{ color: '#000000' }}>Text</Text>
</View>
```

**After:**
```javascript
<View style={{ backgroundColor: colors.cardBackground }}>
  <Text style={{ color: colors.textPrimary }}>Text</Text>
</View>
```

### Step 4: Update StyleSheet
**Before:**
```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
  },
});
```

**After:**
```javascript
// Use inline styles with theme colors
<View style={[styles.container, { backgroundColor: colors.background }]}>
```

## Components Already Updated
- ✅ SettingsScreen (with theme selector)
- ✅ Design System (color palettes, gradients, shadows)
- ✅ ThemeContext (state management)

## Components to Update
The following components should be updated to use `useThemedStyles()`:
- AdminDashboardScreen
- StudentDetailScreen
- CurvedHeader
- NoticeBoard
- MenuGrid
- StatCard
- CustomCard
- All other screens and components

## Best Practices

1. **Always use theme tokens**: Never hardcode colors
2. **Test both themes**: Ensure readability in both light and dark modes
3. **Use semantic colors**: Use `colors.error`, `colors.success` instead of specific colors
4. **Consider contrast**: Ensure text is readable against backgrounds
5. **Update gradients**: Use `gradients.primary` instead of hardcoded gradient arrays

## Troubleshooting

### Theme not persisting
- Check AsyncStorage permissions
- Verify ThemeProvider wraps the entire app

### Colors not updating
- Ensure component uses `useThemedStyles()` hook
- Check if colors are applied inline, not in static StyleSheet

### System theme not working
- Verify `Appearance` API is available
- Check device settings allow app to detect system theme

## Future Enhancements
- [ ] Animated theme transitions
- [ ] Per-screen theme overrides
- [ ] High contrast mode
- [ ] Custom color schemes
- [ ] Theme scheduling (auto-switch at sunset)
