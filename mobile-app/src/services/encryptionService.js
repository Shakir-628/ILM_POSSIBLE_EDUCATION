import CryptoJS from 'crypto-js';

/**
 * Encryption Service for securing sensitive data in network calls
 * Uses AES encryption with a shared secret key
 */

// IMPORTANT: In production, this key should be:
// 1. Stored in environment variables
// 2. Rotated periodically
// 3. Different for each environment (dev/staging/prod)
// 4. Ideally, use public key encryption (RSA) for better security
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ILM_POSSIBLE_EDUCATION_2025_SECRET_KEY';

class EncryptionService {
    /**
     * Encrypt a string using AES encryption
     * @param {string} text - Plain text to encrypt
     * @returns {string} - Encrypted text (base64)
     */
    encrypt(text) {
        try {
            if (!text) return text;

            const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt an encrypted string
     * @param {string} encryptedText - Encrypted text (base64)
     * @returns {string} - Decrypted plain text
     */
    decrypt(encryptedText) {
        try {
            if (!encryptedText) return encryptedText;

            const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Hash a string using SHA256
     * @param {string} text - Text to hash
     * @returns {string} - Hashed text
     */
    hash(text) {
        try {
            if (!text) return text;

            const hashed = CryptoJS.SHA256(text).toString();
            return hashed;
        } catch (error) {
            console.error('Hashing error:', error);
            throw new Error('Failed to hash data');
        }
    }

    /**
     * Encrypt an object (converts to JSON first)
     * @param {object} obj - Object to encrypt
     * @returns {string} - Encrypted JSON string
     */
    encryptObject(obj) {
        try {
            const jsonString = JSON.stringify(obj);
            return this.encrypt(jsonString);
        } catch (error) {
            console.error('Object encryption error:', error);
            throw new Error('Failed to encrypt object');
        }
    }

    /**
     * Decrypt to an object
     * @param {string} encryptedText - Encrypted JSON string
     * @returns {object} - Decrypted object
     */
    decryptObject(encryptedText) {
        try {
            const decrypted = this.decrypt(encryptedText);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Object decryption error:', error);
            throw new Error('Failed to decrypt object');
        }
    }

    /**
     * Generate a random salt
     * @returns {string} - Random salt
     */
    generateSalt() {
        return CryptoJS.lib.WordArray.random(128 / 8).toString();
    }

    /**
     * Encrypt password with timestamp to prevent replay attacks
     * @param {string} password - Password to encrypt
     * @returns {object} - { encryptedPassword, timestamp }
     */
    encryptPassword(password) {
        try {
            const timestamp = Date.now();
            const payload = {
                password,
                timestamp,
                salt: this.generateSalt(),
            };

            const encrypted = this.encryptObject(payload);

            return {
                encryptedPassword: encrypted,
                timestamp,
            };
        } catch (error) {
            console.error('Password encryption error:', error);
            throw new Error('Failed to encrypt password');
        }
    }

    /**
     * Create HMAC signature for request verification
     * @param {string} data - Data to sign
     * @param {string} secret - Secret key
     * @returns {string} - HMAC signature
     */
    createSignature(data, secret = ENCRYPTION_KEY) {
        try {
            const signature = CryptoJS.HmacSHA256(data, secret).toString();
            return signature;
        } catch (error) {
            console.error('Signature creation error:', error);
            throw new Error('Failed to create signature');
        }
    }

    /**
     * Verify HMAC signature
     * @param {string} data - Original data
     * @param {string} signature - Signature to verify
     * @param {string} secret - Secret key
     * @returns {boolean} - True if signature is valid
     */
    verifySignature(data, signature, secret = ENCRYPTION_KEY) {
        try {
            const expectedSignature = this.createSignature(data, secret);
            return signature === expectedSignature;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
}

export default new EncryptionService();
