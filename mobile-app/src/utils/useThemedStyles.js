import { useTheme } from '../context/ThemeContext';
import { getColors, getGradients, getShadows, spacing, borderRadius, fontSize, fontWeight } from './designSystem';

/**
 * Custom hook to get theme-aware design tokens
 * Usage: const { colors, gradients, shadows } = useThemedStyles();
 */
export const useThemedStyles = () => {
    const { isDarkMode } = useTheme();

    return {
        colors: getColors(isDarkMode),
        gradients: getGradients(isDarkMode),
        shadows: getShadows(isDarkMode),
        spacing,
        borderRadius,
        fontSize,
        fontWeight,
        isDarkMode,
    };
};

export default useThemedStyles;
