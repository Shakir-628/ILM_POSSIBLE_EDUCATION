import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Student ID Card (PDF)
 * @param {Object} student - Student data
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} - Path to generated PDF
 */
export const generateStudentIDCard = async (student, outputPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document in landscape mode for ID card
      const doc = new PDFDocument({
        size: [432, 288], // 6x4 inches in points (72 points per inch)
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
      });

      // Create output stream
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Background and border
      doc
        .rect(0, 0, 432, 288)
        .fill("#f0f9ff");

      // Header background
      doc
        .rect(0, 0, 432, 60)
        .fill("#0369a1");

      // School name
      doc
        .fontSize(20)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("ILM POSSIBLE EDUCATION", 20, 20, {
          width: 392,
          align: "center",
        });

      // Photo placeholder (left side)
      doc
        .rect(30, 80, 100, 120)
        .stroke("#0369a1");
      
      doc
        .fontSize(10)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("PHOTO", 30, 130, {
          width: 100,
          align: "center",
        });

      // Student Information (right side)
      const infoX = 150;
      let infoY = 90;
      const lineHeight = 20;

      doc.fontSize(12).fillColor("#0f172a").font("Helvetica-Bold");
      
      // Student ID
      doc.text("Student ID:", infoX, infoY);
      doc.font("Helvetica").text(student.studentId || "N/A", infoX + 100, infoY);
      infoY += lineHeight;

      // Name
      doc.font("Helvetica-Bold").text("Name:", infoX, infoY);
      doc.font("Helvetica").text(
        `${student.firstName} ${student.lastName}`,
        infoX + 100,
        infoY,
        { width: 150 }
      );
      infoY += lineHeight;

      // Class
      doc.font("Helvetica-Bold").text("Class:", infoX, infoY);
      doc.font("Helvetica").text(
        student.class ? `${student.class.className} - ${student.class.grade}` : "N/A",
        infoX + 100,
        infoY
      );
      infoY += lineHeight;

      // DOB
      doc.font("Helvetica-Bold").text("DOB:", infoX, infoY);
      doc.font("Helvetica").text(
        student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A",
        infoX + 100,
        infoY
      );
      infoY += lineHeight;

      // Blood Group
      if (student.bloodGroup) {
        doc.font("Helvetica-Bold").text("Blood Group:", infoX, infoY);
        doc.font("Helvetica").text(student.bloodGroup, infoX + 100, infoY);
        infoY += lineHeight;
      }

      // Contact
      doc.font("Helvetica-Bold").text("Contact:", infoX, infoY);
      doc.font("Helvetica").text(student.phone || "N/A", infoX + 100, infoY);

      // Generate QR Code
      const qrData = JSON.stringify({
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class ? `${student.class.className}` : "",
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 80,
        margin: 0,
      });

      // Add QR Code (bottom right)
      doc.image(qrCodeBuffer, 330, 190, { width: 80, height: 80 });

      // Footer
      doc
        .fontSize(8)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("In case of emergency, please contact: " + (student.guardianPhone || "N/A"), 20, 250, {
          width: 392,
          align: "center",
        });

      doc
        .fontSize(7)
        .text("www.ilmpossible.edu | contact@ilmpossible.edu", 20, 265, {
          width: 392,
          align: "center",
        });

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        resolve(outputPath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate multiple ID cards in one PDF
 * @param {Array} students - Array of student data
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} - Path to generated PDF
 */
export const generateBulkIDCards = async (students, outputPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      for (let i = 0; i < students.length; i++) {
        if (i > 0) {
          doc.addPage();
        }

        const student = students[i];

        // Similar card design as single card but in A4 format
        // Background
        doc.rect(50, 50, 500, 350).fill("#f0f9ff");

        // Header
        doc.rect(50, 50, 500, 80).fill("#0369a1");

        doc
          .fontSize(24)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("ILM POSSIBLE EDUCATION", 50, 70, {
            width: 500,
            align: "center",
          });

        // Photo area
        doc.rect(80, 160, 150, 180).stroke("#0369a1");
        doc
          .fontSize(12)
          .fillColor("#64748b")
          .font("Helvetica")
          .text("PHOTO", 80, 240, { width: 150, align: "center" });

        // Student info
        const infoX = 260;
        let infoY = 170;
        const lineHeight = 30;

        doc.fontSize(14).fillColor("#0f172a").font("Helvetica-Bold");

        doc.text("Student ID:", infoX, infoY);
        doc.font("Helvetica").text(student.studentId || "N/A", infoX + 120, infoY);
        infoY += lineHeight;

        doc.font("Helvetica-Bold").text("Name:", infoX, infoY);
        doc
          .font("Helvetica")
          .text(`${student.firstName} ${student.lastName}`, infoX + 120, infoY, {
            width: 200,
          });
        infoY += lineHeight;

        doc.font("Helvetica-Bold").text("Class:", infoX, infoY);
        doc
          .font("Helvetica")
          .text(
            student.class ? `${student.class.className} - ${student.class.grade}` : "N/A",
            infoX + 120,
            infoY
          );
        infoY += lineHeight;

        doc.font("Helvetica-Bold").text("DOB:", infoX, infoY);
        doc
          .font("Helvetica")
          .text(
            student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A",
            infoX + 120,
            infoY
          );
        infoY += lineHeight;

        doc.font("Helvetica-Bold").text("Contact:", infoX, infoY);
        doc.font("Helvetica").text(student.phone || "N/A", infoX + 120, infoY);

        // QR Code
        const qrData = JSON.stringify({
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
        });

        const qrCodeBuffer = await QRCode.toBuffer(qrData, {
          errorCorrectionLevel: "H",
          type: "png",
          width: 100,
        });

        doc.image(qrCodeBuffer, 430, 250, { width: 100, height: 100 });

        // Footer
        doc
          .fontSize(10)
          .fillColor("#64748b")
          .text(
            "Emergency Contact: " + (student.guardianPhone || "N/A"),
            50,
            430,
            { width: 500, align: "center" }
          );
      }

      doc.end();

      stream.on("finish", () => {
        resolve(outputPath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete ID card file
 * @param {string} filePath - Path to ID card file
 */
export const deleteIDCard = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("ID Card deletion error:", error);
  }
};

