import { sendEmail as sendBaseEmail } from './mailService.js';
import { sendWhatsAppMessage } from './whatsappService.js';

/**
 * Communication Service
 * Handles multi-channel communication: Email, SMS, WhatsApp
 */

// Email handler
export const sendEmail = async (options) => {
  return await sendBaseEmail(options);
};

// SMS handler (Stub for integration)
export const sendSMS = async (to, message) => {
  try {
    console.log(`[SMS Service] Sending to ${to}: ${message}`);
    // Integration point for SMS gateway (e.g., Twilio, Nexmo)
    return { success: true, provider: 'Simulated SMS' };
  } catch (error) {
    console.error('[SMS Service] Error:', error);
    return { success: false, error: error.message };
  }
};


// WhatsApp handler
export const sendWhatsApp = async (to, message) => {
  try {
    return await sendWhatsAppMessage(to, message);
  } catch (error) {
    console.error('[WhatsApp Service] Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send intelligent notification across multiple channels
 */
export const sendMultiChannelMessage = async ({ student, parent, message, subject, template = 'general' }) => {
  const results = { email: null, sms: null, whatsapp: null };
  
  // 1. Send Email if available
  const emailTo = parent?.email || student?.email;
  if (emailTo) {
    results.email = await sendEmail({
      to: emailTo,
      subject: subject || 'School Notification',
      html: message, // Assuming message is HTML if template is general
    });
  }

  // 2. Send SMS if phone available
  const phoneTo = parent?.phone || student?.phone;
  if (phoneTo) {
    // Strip HTML for SMS
    const textMessage = message.replace(/<[^>]*>?/gm, '');
    results.sms = await sendSMS(phoneTo, textMessage);
  }

  // 3. Send WhatsApp if phone available
  if (phoneTo) {
    const textMessage = message.replace(/<[^>]*>?/gm, '');
    results.whatsapp = await sendWhatsApp(phoneTo, textMessage);
  }

  return results;
};

export default {
  sendEmail,
  sendSMS,
  sendWhatsApp,
  sendMultiChannelMessage,
};
