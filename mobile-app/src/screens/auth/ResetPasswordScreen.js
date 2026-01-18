import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { email, otp } = route.params;
    const toast = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, otp, password);
            toast.success('Password reset successful! 🎉');

            // Navigate to login and reset navigation stack
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#4F46E5', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-open-outline" size={48} color="#fff" />
                </View>
                <Text style={styles.headerTitle}>New Password</Text>
                <Text style={styles.headerSubtitle}>
                    Set a strong password to protect{'\n'}your account
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.form}>
                    <CustomInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        icon="lock-closed-outline"
                        rightElement={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.gray500}
                                />
                            </TouchableOpacity>
                        }
                    />

                    <CustomInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        icon="lock-closed-outline"
                    />

                    <View style={styles.requirementsContainer}>
                        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                        <View style={styles.requirement}>
                            <Ionicons
                                name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={password.length >= 6 ? "#22c55e" : colors.gray400}
                            />
                            <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                                Minimum 6 characters
                            </Text>
                        </View>
                    </View>

                    <CustomButton
                        title="Update Password"
                        onPress={handleReset}
                        loading={loading}
                        fullWidth
                        style={styles.resetButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
    },
    form: {
        marginTop: 10,
    },
    requirementsContainer: {
        marginBottom: 30,
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.gray700,
        marginBottom: 10,
    },
    requirement: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    requirementText: {
        fontSize: 12,
        color: colors.gray500,
        marginLeft: 8,
    },
    requirementMet: {
        color: '#22c55e',
        fontWeight: '500',
    },
    resetButton: {
        width: '100%',
    },
});

export default ResetPasswordScreen;
