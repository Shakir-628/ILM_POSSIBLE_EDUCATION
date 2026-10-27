import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// Initialize the WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }), // Saves session locally so you don't have to scan QR every time
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('[WhatsApp Service] QR Code received, please scan it:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('[WhatsApp Service] Client is ready!');
    isReady = true;
});

client.on('authenticated', () => {
    console.log('[WhatsApp Service] Authenticated successfully');
});

client.on('auth_failure', msg => {
    console.error('[WhatsApp Service] Authentication failure', msg);
});

client.on('disconnected', (reason) => {
    console.log('[WhatsApp Service] Client was disconnected', reason);
    isReady = false;
});

// Start the client
client.initialize().catch(err => console.error('[WhatsApp Service] Failed to initialize client', err));

/**
 * Send a WhatsApp message
 * @param {string} to Phone number in international format (e.g., '1234567890')
 * @param {string} message The message body
 */
export const sendWhatsAppMessage = async (to, message) => {
    if (!isReady) {
        console.warn('[WhatsApp Service] Client is NOT ready. Have you scanned the QR code?');
        return { success: false, error: 'WhatsApp client not ready - please scan QR code first' };
    }

    try {
        // Strip out any non-numeric characters
        let formattedNumber = to.replace(/\D/g, '');
        
        // Ensure it has the Pakistan country code (92)
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '92' + formattedNumber.substring(1);
        } else if (!formattedNumber.startsWith('92')) {
            formattedNumber = '92' + formattedNumber;
        }
        
        // Append WhatsApp suffix
        const chatId = `${formattedNumber}@c.us`;

        console.log(`[WhatsApp Service] Sending to ${chatId}...`);
        const response = await client.sendMessage(chatId, message);
        console.log(`[WhatsApp Service] ✅ Sent to ${chatId}`);
        
        return { success: true, to: chatId, messageId: response.id._serialized, provider: 'whatsapp-web.js' };
    } catch (error) {
        console.error(`[WhatsApp Service] ❌ Failed to send to ${to}:`, error.message);
        return { success: false, to, error: error.message };
    }
};

export default {
    sendWhatsAppMessage,
    client
};
