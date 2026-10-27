import '../services/whatsappService.js';

console.log('Starting WhatsApp service standalone to scan QR code...');
// The service initializes automatically on import, so we just wait here
// and log instructions.

console.log('Wait for the QR code to be generated. Once it appears, open WhatsApp on your phone, go to Linked Devices -> Link a Device, and scan the QR code.');

// Keep process alive
process.stdin.resume();
