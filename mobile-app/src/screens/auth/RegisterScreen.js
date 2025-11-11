import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import PasswordPolicy from '../../components/PasswordPolicy';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (touched.name && !formData.name) {
      newErrors.name = 'Name is required';
    }

    if (touched.email) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (touched.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Welcome to ILM Possible! 🎉');
      
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      
      // Shake animation on error
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Header */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join ILM Possible Education</Text>
          </LinearGradient>
        </Animated.View>

        {/* Form Section */}
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.inputsContainer}>
            <CustomInput
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                setTouched({ ...touched, name: true });
              }}
              placeholder="Enter your full name"
              icon="person-outline"
              error={touched.name && errors.name}
              required
            />

            <CustomInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                setTouched({ ...touched, email: true });
              }}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={touched.email && errors.email}
              required
            />

            <CustomInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                setTouched({ ...touched, password: true });
              }}
              placeholder="Create a password (min 6 characters)"
              secureTextEntry
              icon="lock-closed-outline"
              error={touched.password && errors.password}
              required
            />

            {/* Password Policy with Strength Indicator */}
            {formData.password.length > 0 && (
              <PasswordPolicy password={formData.password} showStrength={true} />
            )}

            <CustomInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                setTouched({ ...touched, confirmPassword: true });
              }}
              placeholder="Confirm your password"
              secureTextEntry
              icon="lock-closed-outline"
              error={touched.confirmPassword && errors.confirmPassword}
              required
            />

            {/* Password Match Indicator */}
            {formData.password && formData.confirmPassword && (
              <View style={styles.matchIndicator}>
                <Ionicons
                  name={formData.password === formData.confirmPassword ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={formData.password === formData.confirmPassword ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.matchText,
                    { color: formData.password === formData.confirmPassword ? colors.success : colors.error },
                  ]}
                >
                  {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <CustomButton
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleRegister}
              loading={loading}
              fullWidth
              icon="person-add-outline"
              style={styles.registerButton}
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.terms}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.termsText}>
              {' '}By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
    width: 40,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: fontWeight.medium,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    marginTop: -spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
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
  inputsContainer: {
    paddingHorizontal: spacing.xxl,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.xxl,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loginText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  termsText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    lineHeight: 16,
    flex: 1,
  },
});

export default RegisterScreen;

