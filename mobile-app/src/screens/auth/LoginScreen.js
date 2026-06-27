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
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import BiometricService from '../../services/biometricService';
import { useDesignSystem } from '../../utils/designSystem';

const LoginScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, fontWeight, borderRadius, gradients, shadows, isDarkMode } = useDesignSystem();
  const styles = getStyles(colors, isDarkMode, shadows, spacing, fontSize, fontWeight, borderRadius);
  const { login, isAuthenticated, user, setIsLoggingIn } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('Biometric');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
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
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Check biometric availability
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, role:', user.role);
    }
  }, [isAuthenticated, user]);

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [email, password]);

  const checkBiometricAvailability = async () => {
    try {
      const info = await BiometricService.getDeviceBiometricInfo();
      setBiometricAvailable(info.enabled && info.supported && info.enrolled);
      setBiometricTypeName(info.typeName);
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      const result = await BiometricService.getStoredCredentials();

      if (result.success && result.credentials) {
        const { email: storedEmail, password: storedPassword } = result.credentials;

        // Perform login with stored credentials
        const loginResult = await login(storedEmail, storedPassword);
        if (loginResult) {
          console.log('Biometric login successful:', loginResult?.user?.role || 'unknown role');
          toast.success(`Welcome back! 🎉`);
          setIsLoggingIn(true);
        }
      } else {
        toast.error(result.error || 'Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (touched.email) {
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (touched.password) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result) {
        console.log('Login successful:', result?.user?.role || 'unknown role');
        toast.success('Welcome back! 🎉');
        setIsLoggingIn(true);
      }
    } catch (error) {
      console.error('Login error in screen:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';
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
            {/* Background Decorative Circles */}
            <View style={styles.headerCircle1} />
            <View style={styles.headerCircle2} />

            <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
              <View style={styles.logoCircle}>
                <Ionicons name="school" size={56} color={colors.white} />
              </View>
              <Text style={styles.appName}>ILM Possible</Text>
              <View style={styles.taglineBadge}>
                <Text style={styles.appTagline}>EDUCATION MANAGEMENT SYSTEM</Text>
              </View>
            </Animated.View>
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
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
            <Text style={styles.subtitleText}>Sign in to continue your learning journey</Text>
          </View>

          {/* Form Content */}
          <View style={styles.inputsContainer}>
            <CustomInput
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
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
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setTouched({ ...touched, password: true });
              }}
              placeholder="Enter your password"
              secureTextEntry
              icon="lock-closed-outline"
              error={touched.password && errors.password}
              required
            />
          </View>

          <View style={styles.buttonsContainer}>
            <CustomButton
              title={loading ? 'SIGNING IN...' : 'SIGN IN'}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              icon="log-in-outline"
              style={styles.loginButton}
            />

            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                  style={styles.biometricGradient}
                >
                  <Ionicons name="finger-print" size={28} color={colors.primary} />
                  <Text style={styles.biometricText}>
                    Sign in with {biometricTypeName}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButtonContainer}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.footerText}>SECURE LOGIN</Text>
            </View>
          </View>

          <View style={styles.copyright}>
            <Text style={styles.copyrightText}>© 2025 ILM Possible Education</Text>
            <Text style={styles.copyrightSubtext}>Karachi, Pakistan</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors, isDarkMode, shadows, spacing, fontSize, fontWeight, borderRadius) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.xxxl + 20,
    paddingBottom: spacing.xxxl + 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.medium,
  },
  appName: {
    fontSize: 42,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  taglineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appTagline: {
    fontSize: 10,
    color: colors.white,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl + 12,
    borderTopRightRadius: borderRadius.xl + 12,
    marginTop: -spacing.xl - 10,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    ...shadows.large,
  },
  welcomeContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: fontWeight.medium,
  },
  inputsContainer: {
    paddingHorizontal: spacing.xxl,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.sm,
  },
  loginButton: {
    ...shadows.medium,
  },
  biometricButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  biometricGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  biometricText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  forgotButtonContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  forgotText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  registerText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  registerLink: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  copyright: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  copyrightText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
  },
  copyrightSubtext: {
    fontSize: 10,
    color: colors.gray400,
    marginTop: 4,
    fontWeight: fontWeight.medium,
  },
});

export default LoginScreen;

