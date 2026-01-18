import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../utils/designSystem';

const OTPScreen = ({ navigation, route }) => {
    const { email } = route.params;
    const toast = useToast();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    const inputs = useRef([]);

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            toast.error('Please enter the full 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOTP(email, otpString);
            toast.success('OTP verified successfully!');
            navigation.navigate('ResetPassword', { email, otp: otpString });
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        try {
            await authService.forgotPassword(email);
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputs.current[0].focus();
            toast.success('A new OTP has been sent to your email');
        } catch (error) {
            toast.error('Failed to resend OTP');
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
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark-outline" size={48} color="#fff" />
                </View>
                <Text style={styles.headerTitle}>Verification</Text>
                <Text style={styles.headerSubtitle}>
                    Enter the 6-digit code sent to{'\n'}
                    <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputs.current[index] = ref)}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectionColor={colors.primary}
                        />
                    ))}
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                        {timer > 0
                            ? `Resend code in ${timer}s`
                            : "Didn't receive the code?"}
                    </Text>
                    {timer === 0 && (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendText}>Resend OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <CustomButton
                    title="Verify & Proceed"
                    onPress={handleVerify}
                    loading={loading}
                    fullWidth
                    style={styles.verifyButton}
                />
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
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        zIndex: 10,
        padding: 8,
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
    emailHighlight: {
        fontWeight: 'bold',
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 40,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        backgroundColor: '#f9fafb',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    timerText: {
        fontSize: 14,
        color: '#6b7280',
        marginRight: 6,
    },
    resendText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    verifyButton: {
        width: '100%',
    },
});

export default OTPScreen;
