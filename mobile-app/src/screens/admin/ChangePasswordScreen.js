import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomCard from '../../components/CustomCard';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import PasswordPolicy from '../../components/PasswordPolicy';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';

const ChangePasswordScreen = ({ navigation }) => {
  const toast = useToast();
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (touched.currentPassword && !formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (touched.newPassword) {
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      } else if (formData.newPassword === formData.currentPassword) {
        newErrors.newPassword = 'New password must be different from current';
      }
    }

    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password changed successfully! Please login again.');
      
      // Logout user after password change
      setTimeout(async () => {
        await logout();
        if (Platform.OS === 'web') {
          window.location.reload();
        }
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="key" size={40} color={colors.white} style={styles.headerIcon} />
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Update your account password</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <CustomCard style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Security Tip</Text>
            <Text style={styles.infoText}>
              Use a strong password with uppercase, lowercase, numbers, and at least 8 characters.
            </Text>
          </View>
        </CustomCard>

        <CustomCard style={styles.formCard}>
          <CustomInput
            label="Current Password"
            value={formData.currentPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, currentPassword: text });
              setTouched({ ...touched, currentPassword: true });
            }}
            placeholder="Enter your current password"
            secureTextEntry
            icon="lock-closed-outline"
            error={touched.currentPassword && errors.currentPassword}
            required
          />

          <CustomInput
            label="New Password"
            value={formData.newPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, newPassword: text });
              setTouched({ ...touched, newPassword: true });
            }}
            placeholder="Create a new password (min 6 characters)"
            secureTextEntry
            icon="lock-open-outline"
            error={touched.newPassword && errors.newPassword}
            required
          />

          {/* Password Policy with Strength Indicator */}
          {formData.newPassword.length > 0 && (
            <PasswordPolicy password={formData.newPassword} showStrength={true} />
          )}

          <CustomInput
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, confirmPassword: text });
              setTouched({ ...touched, confirmPassword: true });
            }}
            placeholder="Confirm your new password"
            secureTextEntry
            icon="lock-closed-outline"
            error={touched.confirmPassword && errors.confirmPassword}
            required
          />

          {/* Password Match Indicator */}
          {formData.newPassword && formData.confirmPassword && (
            <View style={styles.matchIndicator}>
              <Ionicons
                name={formData.newPassword === formData.confirmPassword ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={formData.newPassword === formData.confirmPassword ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.matchText,
                  { color: formData.newPassword === formData.confirmPassword ? colors.success : colors.error },
                ]}
              >
                {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          <CustomButton
            title={loading ? 'Changing Password...' : 'Change Password'}
            onPress={handleChangePassword}
            loading={loading}
            fullWidth
            icon="checkmark-circle-outline"
            style={styles.submitButton}
          />
        </CustomCard>

        <CustomCard style={styles.warningCard}>
          <Ionicons name="warning" size={24} color={colors.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Notice</Text>
            <Text style={styles.warningText}>
              After changing your password, you will be logged out and need to sign in again with your new password.
            </Text>
          </View>
        </CustomCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
    width: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: fontWeight.medium,
  },
  content: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '15',
    marginBottom: spacing.lg,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  matchText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '15',
  },
  warningContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  warningTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default ChangePasswordScreen;

