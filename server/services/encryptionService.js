import CryptoJS from 'crypto-js';

/**
 * Encryption Service for server-side decryption
 * Must use the same key as the mobile app
 */

// IMPORTANT: This should match the mobile app's encryption key
// In production, use environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ILM_POSSIBLE_EDUCATION_2025_SECRET_KEY';

class EncryptionService {
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
     * Decrypt password from mobile app
     * @param {string} encryptedPassword - Encrypted password payload
     * @returns {string} - Plain text password
     */
    decryptPassword(encryptedPassword) {
        try {
            const payload = this.decryptObject(encryptedPassword);

            // Verify timestamp to prevent replay attacks (optional)
            const now = Date.now();
            const timeDiff = now - payload.timestamp;
            const MAX_TIME_DIFF = 5 * 60 * 1000; // 5 minutes

            if (timeDiff > MAX_TIME_DIFF) {
                console.warn('Password timestamp is too old, but allowing for now');
                // In production, you might want to reject old requests
                // throw new Error('Request expired');
            }

            return payload.password;
        } catch (error) {
            console.error('Password decryption error:', error);
            throw new Error('Failed to decrypt password');
        }
    }

    /**
     * Middleware to decrypt password from request
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {function} next - Express next function
     */
    decryptPasswordMiddleware(req, res, next) {
        try {
            // Check if password is encrypted
            if (req.body.encrypted && req.body.password) {
                req.body.password = this.decryptPassword(req.body.password);

                // Also decrypt newPassword if present (for change password)
                if (req.body.newPassword) {
                    req.body.newPassword = this.decryptPassword(req.body.newPassword);
                }

                // Also decrypt currentPassword if present
                if (req.body.currentPassword) {
                    req.body.currentPassword = this.decryptPassword(req.body.currentPassword);
                }

                // Remove encryption flags
                delete req.body.encrypted;
                delete req.body.timestamp;
            }

            next();
        } catch (error) {
            console.error('Password decryption middleware error:', error);
            res.status(400).json({
                message: 'Invalid encrypted password',
                error: error.message
            });
        }
    }
}

export default new EncryptionService();