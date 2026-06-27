import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients, shadows } from '../utils/designSystem';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, accent, outline, danger
  size = 'medium', // small, medium, large
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    if (size === 'small') baseStyle.push(styles.buttonSmall);
    if (size === 'large') baseStyle.push(styles.buttonLarge);
    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabled);

    if (variant === 'secondary') baseStyle.push(styles.secondary);
    if (variant === 'accent') baseStyle.push(styles.accent);
    if (variant === 'outline') baseStyle.push(styles.outline);
    if (variant === 'danger') baseStyle.push(styles.danger);

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];

    if (size === 'small') baseStyle.push(styles.textSmall);
    if (size === 'large') baseStyle.push(styles.textLarge);

    if (variant === 'outline') baseStyle.push(styles.outlineText);

    return baseStyle;
  };

  const renderGradient = (colors_list) => (
    <LinearGradient
      colors={colors_list}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={20} color={colors.white} style={styles.icon} />}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </LinearGradient>
  );

  if ((variant === 'primary' || variant === 'secondary' || variant === 'accent' || variant === 'danger') && !disabled) {
    let gradientColors = gradients.primary;
    if (variant === 'secondary') gradientColors = gradients.secondary;
    if (variant === 'accent') gradientColors = gradients.accent;
    if (variant === 'danger') gradientColors = gradients.error;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.8}
      >
        {renderGradient(gradientColors)}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'outline' ? colors.primary : colors.white}
              style={styles.icon}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonSmall: {
    paddingVertical: spacing.xs,
  },
  buttonLarge: {
    paddingVertical: spacing.lg,
  },
  gradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: fontSize.sm,
  },
  textLarge: {
    fontSize: fontSize.lg,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.lg - 2,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  outlineText: {
    color: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

export default CustomButton;

