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
import { colors, spacing, fontSize, fontWeight, borderRadius, gradients } from '../../utils/designSystem';

const LoginScreen = ({ navigation }) => {
  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
      console.log('Login successful:', result?.user?.role || 'unknown role');
      toast.success('Welcome back! 🎉');
      
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.reload();
        }, 500);
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

  const handleQuickFill = (role) => {
    const credentials = {
      student: { email: 'student@test.com', password: 'password123' },
      teacher: { email: 'teacher@test.com', password: 'password123' },
      admin: { email: 'admin@ilmpossible.com', password: 'admin123' },
    };
    
    if (credentials[role]) {
      setEmail(credentials[role].email);
      setPassword(credentials[role].password);
      toast.info(`Filled ${role} credentials`);
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
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
              <View style={styles.logoCircle}>
                <Ionicons name="school" size={48} color={colors.white} />
              </View>
              <Text style={styles.appName}>ILM Possible</Text>
              <Text style={styles.appTagline}>Education Management System</Text>
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

          {/* Quick Fill Buttons for Testing */}
          <View style={styles.quickFillContainer}>
            <Text style={styles.quickFillLabel}>Quick Login (Test):</Text>
            <View style={styles.quickFillButtons}>
              <TouchableOpacity
                style={[styles.quickFillBtn, { backgroundColor: colors.student + '20', borderColor: colors.student }]}
                onPress={() => handleQuickFill('student')}
              >
                <Ionicons name="person" size={16} color={colors.student} />
                <Text style={[styles.quickFillText, { color: colors.student }]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickFillBtn, { backgroundColor: colors.teacher + '20', borderColor: colors.teacher }]}
                onPress={() => handleQuickFill('teacher')}
              >
                <Ionicons name="people" size={16} color={colors.teacher} />
                <Text style={[styles.quickFillText, { color: colors.teacher }]}>Teacher</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickFillBtn, { backgroundColor: colors.admin + '20', borderColor: colors.admin }]}
                onPress={() => handleQuickFill('admin')}
              >
                <Ionicons name="shield" size={16} color={colors.admin} />
                <Text style={[styles.quickFillText, { color: colors.admin }]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

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
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              icon="log-in-outline"
              style={styles.loginButton}
            />

            <CustomButton
              title="Forgot Password?"
              onPress={() => navigation.navigate('ForgotPassword')}
              variant="outline"
              fullWidth
              icon="help-circle-outline"
              style={styles.forgotButton}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register Now →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={18} color={colors.success} />
            <Text style={styles.footerText}>  Secure Login</Text>
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
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
    letterSpacing: 0.5,
  },
  appTagline: {
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
    paddingBottom: spacing.xxl,
  },
  welcomeContainer: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  quickFillContainer: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.sm,
  },
  quickFillLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickFillButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickFillBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  quickFillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  inputsContainer: {
    paddingHorizontal: spacing.xxl,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.xxl,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  registerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  copyrightText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  copyrightSubtext: {
    fontSize: fontSize.xs,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
});

export default LoginScreen;

