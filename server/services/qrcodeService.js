import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate QR Code for student ID
 * @param {string} studentId - Student ID
 * @param {object} studentData - Additional student data
 * @returns {Promise<string>} - Path to saved QR code
 */
export const generateStudentQRCode = async (studentId, studentData = {}) => {
  try {
    const qrData = JSON.stringify({
      studentId,
      name: studentData.name || "",
      class: studentData.class || "",
      generatedAt: new Date().toISOString(),
    });

    // Create QR codes directory if it doesn't exist
    const qrDir = path.join(__dirname, "../../uploads/qrcodes");
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const filename = `${studentId}_qr.png`;
    const filepath = path.join(qrDir, filename);

    // Generate QR code
    await QRCode.toFile(filepath, qrData, {
      errorCorrectionLevel: "H",
      type: "png",
      quality: 1,
      margin: 1,
      width: 300,
    });

    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Generate QR Code as base64 string
 * @param {string} studentId - Student ID
 * @param {object} studentData - Additional student data
 * @returns {Promise<string>} - Base64 string
 */
export const generateStudentQRCodeBase64 = async (studentId, studentData = {}) => {
  try {
    const qrData = JSON.stringify({
      studentId,
      name: studentData.name || "",
      class: studentData.class || "",
      generatedAt: new Date().toISOString(),
    });

    const base64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      type: "png",
      quality: 1,
      margin: 1,
      width: 300,
    });

    return base64;
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Delete QR Code file
 * @param {string} qrCodePath - Path to QR code
 */
export const deleteQRCode = (qrCodePath) => {
  try {
    if (qrCodePath && qrCodePath !== "") {
      const fullPath = path.join(__dirname, "../../", qrCodePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error("QR Code deletion error:", error);
  }
};

