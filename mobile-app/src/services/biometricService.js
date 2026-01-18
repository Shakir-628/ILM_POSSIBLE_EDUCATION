import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

const isWeb = Platform.OS === 'web';

// Helper for secure storage with web fallback
const storage = {
    getItem: async (key) => {
        try {
            if (isWeb) {
                return localStorage.getItem(key);
            }
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            return null;
        }
    },
    setItem: async (key, value) => {
        try {
            if (isWeb) {
                localStorage.setItem(key, value);
                return;
            }
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
        }
    },
    deleteItem: async (key) => {
        try {
            if (isWeb) {
                localStorage.removeItem(key);
                return;
            }
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error(`Error deleting item ${key}:`, error);
        }
    }
};

class BiometricService {
    /**
     * Check if device supports biometric authentication
     */
    async isDeviceSupported() {
        if (isWeb) return true; // Support for testing on web
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            return compatible;
        } catch (error) {
            console.error('Error checking biometric hardware:', error);
            return false;
        }
    }

    /**
     * Check if biometric data is enrolled on device
     */
    async isBiometricEnrolled() {
        if (isWeb) return true; // Support for testing on web
        try {
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            return enrolled;
        } catch (error) {
            console.error('Error checking biometric enrollment:', error);
            return false;
        }
    }

    /**
     * Get available biometric types
     */
    async getAvailableBiometrics() {
        if (isWeb) return [1]; // Map to Fingerprint/Generic for testing
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return types;
        } catch (error) {
            console.error('Error getting biometric types:', error);
            return [];
        }
    }

    /**
     * Get biometric type name for display
     */
    async getBiometricTypeName() {
        if (isWeb) return 'Biometric (Web Test Mode)';
        const types = await this.getAvailableBiometrics();

        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return 'Iris Recognition';
        }

        return 'Biometric';
    }

    /**
     * Authenticate user with biometrics
     */
    async authenticate(promptMessage = 'Authenticate to continue') {
        if (isWeb) {
            // Simulate biometric auth on web for testing
            return new Promise((resolve) => {
                const confirmed = window.confirm(`[WEB TEST MODE]\n\n${promptMessage}\n\nClick OK to simulate success.`);
                setTimeout(() => {
                    resolve({
                        success: confirmed,
                        error: confirmed ? null : 'User cancelled',
                    });
                }, 500);
            });
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
                fallbackLabel: 'Use Password',
            });

            return {
                success: result.success,
                error: result.error,
            };
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Check if biometric login is enabled for the app
     */
    async isBiometricLoginEnabled() {
        try {
            const enabled = await storage.getItem(BIOMETRIC_ENABLED_KEY);
            return enabled === 'true';
        } catch (error) {
            console.error('Error checking biometric login status:', error);
            return false;
        }
    }

    /**
     * Enable biometric login and store credentials
     */
    async enableBiometricLogin(email, password) {
        try {
            // First verify device supports biometrics
            const supported = await this.isDeviceSupported();
            if (!supported) {
                return {
                    success: false,
                    error: 'Device does not support biometric authentication',
                };
            }

            // Check if biometrics are enrolled
            const enrolled = await this.isBiometricEnrolled();
            if (!enrolled) {
                return {
                    success: false,
                    error: 'No biometric data enrolled on device. Please set up biometrics in device settings.',
                };
            }

            // Authenticate user before enabling
            const authResult = await this.authenticate('Authenticate to enable biometric login');
            if (!authResult.success) {
                return {
                    success: false,
                    error: 'Authentication failed',
                };
            }

            // Store credentials securely
            const credentials = JSON.stringify({ email, password });
            await storage.setItem(BIOMETRIC_CREDENTIALS_KEY, credentials);
            await storage.setItem(BIOMETRIC_ENABLED_KEY, 'true');

            return {
                success: true,
                message: 'Biometric login enabled successfully',
            };
        } catch (error) {
            console.error('Error enabling biometric login:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Disable biometric login and clear stored credentials
     */
    async disableBiometricLogin() {
        try {
            await storage.deleteItem(BIOMETRIC_CREDENTIALS_KEY);
            await storage.deleteItem(BIOMETRIC_ENABLED_KEY);

            return {
                success: true,
                message: 'Biometric login disabled successfully',
            };
        } catch (error) {
            console.error('Error disabling biometric login:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get stored credentials after biometric authentication
     */
    async getStoredCredentials() {
        try {
            // Check if biometric login is enabled
            const enabled = await this.isBiometricLoginEnabled();
            if (!enabled) {
                return {
                    success: false,
                    error: 'Biometric login is not enabled',
                };
            }

            // Authenticate user
            const authResult = await this.authenticate('Authenticate to login');
            if (!authResult.success) {
                return {
                    success: false,
                    error: 'Authentication failed',
                };
            }

            // Retrieve credentials
            const credentialsString = await storage.getItem(BIOMETRIC_CREDENTIALS_KEY);
            if (!credentialsString) {
                return {
                    success: false,
                    error: 'No credentials found',
                };
            }

            const credentials = JSON.parse(credentialsString);
            return {
                success: true,
                credentials,
            };
        } catch (error) {
            console.error('Error getting stored credentials:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Update stored credentials (when user changes password)
     */
    async updateStoredCredentials(email, newPassword) {
        try {
            const enabled = await this.isBiometricLoginEnabled();
            if (!enabled) {
                return { success: true }; // Nothing to update
            }

            const credentials = JSON.stringify({ email, password: newPassword });
            await storage.setItem(BIOMETRIC_CREDENTIALS_KEY, credentials);

            return {
                success: true,
                message: 'Biometric credentials updated',
            };
        } catch (error) {
            console.error('Error updating credentials:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get device biometric info for display
     */
    async getDeviceBiometricInfo() {
        try {
            const supported = await this.isDeviceSupported();
            const enrolled = await this.isBiometricEnrolled();
            const types = await this.getAvailableBiometrics();
            const typeName = await this.getBiometricTypeName();
            const enabled = await this.isBiometricLoginEnabled();

            return {
                supported,
                enrolled,
                types,
                typeName,
                enabled,
            };
        } catch (error) {
            console.error('Error getting biometric info:', error);
            return {
                supported: false,
                enrolled: false,
                types: [],
                typeName: 'Unknown',
                enabled: false,
            };
        }
    }
}

export default new BiometricService();

