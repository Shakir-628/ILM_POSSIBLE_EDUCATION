import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../utils/designSystem';

/**
 * Password Policy Component
 * Shows password requirements with live validation feedback
 * @param {string} password - Current password value
 * @param {boolean} showStrength - Show strength indicator (default: true)
 * @param {boolean} compact - Compact view (default: false)
 */
const PasswordPolicy = ({ password = '', showStrength = true, compact = false }) => {
  const requirements = [
    { 
      label: 'At least 6 characters', 
      met: password.length >= 6,
      icon: 'text-outline'
    },
    { 
      label: 'At least 8 characters (recommended)', 
      met: password.length >= 8,
      icon: 'text-outline',
      optional: true
    },
    { 
      label: 'Contains uppercase letter', 
      met: /[A-Z]/.test(password),
      icon: 'arrow-up-outline',
      optional: true
    },
    { 
      label: 'Contains number', 
      met: /[0-9]/.test(password),
      icon: 'keypad-outline',
      optional: true
    },
  ];

  // Calculate password strength
  const calculateStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = calculateStrength();

  const getStrengthColor = () => {
    if (strength <= 25) return colors.error;
    if (strength <= 50) return colors.warning;
    if (strength <= 75) return colors.info;
    return colors.success;
  };

  const getStrengthText = () => {
    if (strength === 0) return 'Very Weak';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  if (compact && password.length === 0) {
    return null; // Don't show anything if no password and compact mode
  }

  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={styles.title}>Password Requirements:</Text>
      )}

      {/* Password Strength Bar */}
      {showStrength && password.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBarContainer}>
            <View
              style={[
                styles.strengthBar,
                {
                  width: `${strength}%`,
                  backgroundColor: getStrengthColor(),
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
            {getStrengthText()}
          </Text>
        </View>
      )}

      {/* Requirements List */}
      {!compact && (
        <View style={styles.requirementsList}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementRow}>
              <View style={[styles.checkCircle, req.met && styles.checkCircleMet]}>
                <Ionicons 
                  name={req.met ? 'checkmark' : req.icon} 
                  size={14} 
                  color={req.met ? colors.white : colors.gray400} 
                />
              </View>
              <Text style={[
                styles.requirementText,
                req.met && styles.requirementTextMet,
                req.optional && styles.requirementOptional
              ]}>
                {req.label}
                {req.optional && <Text style={styles.optionalTag}> (optional)</Text>}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Compact view - just show met/unmet count */}
      {compact && password.length > 0 && (
        <View style={styles.compactView}>
          <Text style={styles.compactText}>
            {requirements.filter(r => r.met && !r.optional).length}/
            {requirements.filter(r => !r.optional).length} required met
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  strengthBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  strengthText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    minWidth: 60,
  },
  requirementsList: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkCircleMet: {
    backgroundColor: colors.success,
  },
  requirementText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  requirementTextMet: {
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  requirementOptional: {
    fontStyle: 'italic',
  },
  optionalTag: {
    fontSize: fontSize.xs,
    color: colors.gray400,
  },
  compactView: {
    paddingVertical: spacing.xs,
  },
  compactText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default PasswordPolicy;

