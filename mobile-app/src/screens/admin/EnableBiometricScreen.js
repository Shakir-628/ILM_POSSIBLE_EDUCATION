import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useThemedStyles from '../../utils/useThemedStyles';
import BiometricService from '../../services/biometricService';
import Loading from '../../components/Loading';

const EnableBiometricScreen = ({ navigation, route }) => {
    const { user, login } = useAuth();
    const toast = useToast();
    const { colors, gradients } = useThemedStyles();
    const { onSuccess } = route.params || {};

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEnableBiometric = async () => {
        if (!password.trim()) {
            toast.error('Please enter your password');
            return;
        }

        setLoading(true);

        try {
            // Verify password by attempting login
            const loginResult = await login(user.email, password);

            if (!loginResult.success) {
                toast.error('Incorrect password');
                setLoading(false);
                return;
            }

            // Enable biometric with verified credentials
            const result = await BiometricService.enableBiometricLogin(user.email, password);

            if (result.success) {
                toast.success(result.message);
                if (onSuccess) {
                    onSuccess();
                }
                navigation.goBack();
            } else {
                toast.error(result.error || 'Failed to enable biometric login');
            }
        } catch (error) {
            console.error('Error enabling biometric:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Setting up biometric authentication..." />;
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient colors={gradients.primary} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Enable Biometric Login</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons name="finger-print" size={64} color={colors.primary} />
                </View>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    Verify Your Identity
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Enter your password to enable biometric authentication for quick and secure login.
                </Text>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
                    <View style={[styles.inputContainer, {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.gray300,
                    }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, { opacity: !password.trim() ? 0.5 : 1 }]}
                    onPress={handleEnableBiometric}
                    disabled={!password.trim() || loading}
                >
                    <LinearGradient colors={gradients.primary} style={styles.buttonGradient}>
                        <Text style={styles.buttonText}>Enable Biometric Login</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Your password will be securely stored on this device only and used for biometric authentication.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    form: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});

export default EnableBiometricScreen;
