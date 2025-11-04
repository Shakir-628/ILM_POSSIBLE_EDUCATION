import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure certificates directory exists
const certificatesDir = path.join(__dirname, "../uploads/certificates");
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// Generate QR Code for certificate verification
export const generateCertificateQR = async (certificateNumber, verificationCode) => {
  try {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-certificate/${verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating certificate QR code:", error);
    throw error;
  }
};

// Helper function to wrap text
const wrapText = (doc, text, width) => {
  return doc.heightOfString(text, { width });
};

// Replace placeholders in template
const replacePlaceholders = (template, data) => {
  let result = template;
  
  // Student placeholders
  result = result.replace(/{{studentName}}/g, data.studentName || "");
  result = result.replace(/{{studentId}}/g, data.studentId || "");
  result = result.replace(/{{fatherName}}/g, data.fatherName || "");
  result = result.replace(/{{motherName}}/g, data.motherName || "");
  result = result.replace(/{{dateOfBirth}}/g, data.dateOfBirth || "");
  result = result.replace(/{{gender}}/g, data.gender || "");
  result = result.replace(/{{class}}/g, data.className || "");
  result = result.replace(/{{section}}/g, data.section || "");
  result = result.replace(/{{rollNumber}}/g, data.rollNumber || "");
  result = result.replace(/{{admissionNumber}}/g, data.admissionNumber || "");
  
  // Certificate placeholders
  result = result.replace(/{{certificateNumber}}/g, data.certificateNumber || "");
  result = result.replace(/{{issueDate}}/g, data.issueDate || "");
  result = result.replace(/{{academicYear}}/g, data.academicYear || "");
  result = result.replace(/{{certificateType}}/g, data.certificateType || "");
  
  // School placeholders
  result = result.replace(/{{schoolName}}/g, data.schoolName || "School Name");
  result = result.replace(/{{schoolAddress}}/g, data.schoolAddress || "");
  result = result.replace(/{{schoolPhone}}/g, data.schoolPhone || "");
  result = result.replace(/{{schoolEmail}}/g, data.schoolEmail || "");
  
  // Additional placeholders
  result = result.replace(/{{reasonForLeaving}}/g, data.reasonForLeaving || "");
  result = result.replace(/{{dateOfLeaving}}/g, data.dateOfLeaving || "");
  result = result.replace(/{{achievementTitle}}/g, data.achievementTitle || "");
  result = result.replace(/{{position}}/g, data.position || "");
  result = result.replace(/{{eventName}}/g, data.eventName || "");
  result = result.replace(/{{conductRating}}/g, data.conductRating || "");
  result = result.replace(/{{remarks}}/g, data.remarks || "");
  
  // Date placeholders
  const today = new Date();
  result = result.replace(/{{currentDate}}/g, today.toLocaleDateString());
  result = result.replace(/{{currentYear}}/g, today.getFullYear().toString());
  
  return result;
};

// Generate certificate PDF
export const generateCertificatePDF = async (certificate, student, template) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: template?.orientation === "letter" ? "LETTER" : "A4",
        layout: template?.layout || "portrait",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const filename = `certificate-${certificate.certificateNumber}.pdf`;
      const filepath = path.join(certificatesDir, filename);
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;

      // Draw border
      if (template?.design?.borderWidth > 0) {
        doc
          .rect(margin - 10, margin - 10, contentWidth + 20, pageHeight - 2 * margin + 20)
          .lineWidth(template.design.borderWidth || 2)
          .stroke(template?.design?.borderColor || "#000000");
      }

      // Draw decorative corners
      const cornerSize = 20;
      doc
        .moveTo(margin, margin + cornerSize)
        .lineTo(margin, margin)
        .lineTo(margin + cornerSize, margin)
        .lineWidth(3)
        .stroke("#4F46E5");

      doc
        .moveTo(pageWidth - margin - cornerSize, margin)
        .lineTo(pageWidth - margin, margin)
        .lineTo(pageWidth - margin, margin + cornerSize)
        .lineWidth(3)
        .stroke("#4F46E5");

      doc
        .moveTo(margin, pageHeight - margin - cornerSize)
        .lineTo(margin, pageHeight - margin)
        .lineTo(margin + cornerSize, pageHeight - margin)
        .lineWidth(3)
        .stroke("#4F46E5");

      doc
        .moveTo(pageWidth - margin - cornerSize, pageHeight - margin)
        .lineTo(pageWidth - margin, pageHeight - margin)
        .lineTo(pageWidth - margin, pageHeight - margin - cornerSize)
        .lineWidth(3)
        .stroke("#4F46E5");

      let yPosition = margin + 20;

      // Header - School Logo and Name
      if (template?.header?.showLogo !== false) {
        // School Name
        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .fillColor("#1F2937")
          .text(
            template?.header?.schoolName?.replace("{{schoolName}}", process.env.SCHOOL_NAME || "ILM Possible Education") || "ILM Possible Education",
            margin,
            yPosition,
            {
              width: contentWidth,
              align: template?.header?.logoPosition || "center",
            }
          );
        yPosition += 30;

        // School Address
        if (template?.header?.schoolAddress) {
          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#6B7280")
            .text(
              template.header.schoolAddress.replace("{{schoolAddress}}", process.env.SCHOOL_ADDRESS || ""),
              margin,
              yPosition,
              {
                width: contentWidth,
                align: "center",
              }
            );
          yPosition += 25;
        }
      }

      // Horizontal line after header
      if (template?.header?.showHeaderBorder !== false) {
        doc
          .moveTo(margin + 50, yPosition)
          .lineTo(pageWidth - margin - 50, yPosition)
          .lineWidth(2)
          .stroke("#4F46E5");
        yPosition += 30;
      }

      // Certificate Title
      doc
        .fontSize(template?.title?.fontSize || 24)
        .font("Helvetica-Bold")
        .fillColor(template?.title?.color || "#1F2937")
        .text(
          template?.title?.text || certificate.certificateType.toUpperCase() + " CERTIFICATE",
          margin,
          yPosition,
          {
            width: contentWidth,
            align: template?.title?.alignment || "center",
          }
        );
      yPosition += 40;

      // Certificate Number and Date
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(
          `Certificate No: ${certificate.certificateNumber}`,
          margin,
          yPosition,
          {
            width: contentWidth / 2 - 10,
            align: "left",
          }
        )
        .text(
          `Date: ${new Date(certificate.issueDate).toLocaleDateString()}`,
          pageWidth / 2 + 10,
          yPosition,
          {
            width: contentWidth / 2 - 10,
            align: "right",
          }
        );
      yPosition += 30;

      // Prepare data for placeholders
      const placeholderData = {
        studentName: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        fatherName: student.guardianName,
        motherName: student.guardianName,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "",
        gender: student.gender,
        className: certificate.class?.className || "",
        section: certificate.class?.section || "",
        certificateNumber: certificate.certificateNumber,
        issueDate: new Date(certificate.issueDate).toLocaleDateString(),
        academicYear: certificate.additionalDetails?.academicYear || "",
        certificateType: certificate.certificateType,
        schoolName: process.env.SCHOOL_NAME || "ILM Possible Education",
        schoolAddress: process.env.SCHOOL_ADDRESS || "",
        reasonForLeaving: certificate.additionalDetails?.reasonForLeaving || "",
        dateOfLeaving: certificate.additionalDetails?.dateOfLeaving
          ? new Date(certificate.additionalDetails.dateOfLeaving).toLocaleDateString()
          : "",
        achievementTitle: certificate.additionalDetails?.achievementTitle || "",
        position: certificate.additionalDetails?.position || "",
        eventName: certificate.additionalDetails?.eventName || "",
        conductRating: certificate.additionalDetails?.conductRating || "",
        remarks: certificate.additionalDetails?.remarks || "",
      };

      // Certificate Content
      const content = template?.content?.template
        ? replacePlaceholders(template.content.template, placeholderData)
        : certificate.content;

      doc
        .fontSize(template?.content?.fontSize || 12)
        .font("Helvetica")
        .fillColor("#1F2937")
        .text(content, margin + 20, yPosition, {
          width: contentWidth - 40,
          align: template?.content?.alignment || "justify",
          lineGap: (template?.content?.lineHeight || 1.5) * 5,
        });

      yPosition = doc.y + 40;

      // Signatures
      const signaturesLayout = template?.signatures?.layout || "horizontal";
      const showClassTeacher = template?.signatures?.showClassTeacher !== false;
      const showPrincipal = template?.signatures?.showPrincipal !== false;
      const showOther = template?.signatures?.showOther === true;

      if (signaturesLayout === "horizontal") {
        const sigWidth = contentWidth / (showClassTeacher && showPrincipal && showOther ? 3 : showClassTeacher && showPrincipal ? 2 : 1);
        let sigXPosition = margin;

        if (showClassTeacher && certificate.signatures?.classTeacher) {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(certificate.signatures.classTeacher.name || "Class Teacher", sigXPosition, pageHeight - 120, {
              width: sigWidth - 20,
              align: "center",
            })
            .fontSize(8)
            .font("Helvetica")
            .text(certificate.signatures.classTeacher.designation || "Class Teacher", sigXPosition, pageHeight - 105, {
              width: sigWidth - 20,
              align: "center",
            });

          // Signature line
          doc
            .moveTo(sigXPosition + 20, pageHeight - 130)
            .lineTo(sigXPosition + sigWidth - 40, pageHeight - 130)
            .stroke();

          sigXPosition += sigWidth;
        }

        if (showPrincipal && certificate.signatures?.principal) {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(certificate.signatures.principal.name || "Principal", sigXPosition, pageHeight - 120, {
              width: sigWidth - 20,
              align: "center",
            })
            .fontSize(8)
            .font("Helvetica")
            .text(certificate.signatures.principal.designation || "Principal", sigXPosition, pageHeight - 105, {
              width: sigWidth - 20,
              align: "center",
            });

          // Signature line
          doc
            .moveTo(sigXPosition + 20, pageHeight - 130)
            .lineTo(sigXPosition + sigWidth - 40, pageHeight - 130)
            .stroke();
        }
      }

      // QR Code for verification
      if (template?.footer?.showQRCode !== false && certificate.verificationCode) {
        try {
          const qrCodeDataUrl = await generateCertificateQR(
            certificate.certificateNumber,
            certificate.verificationCode
          );
          
          // Remove data URL prefix
          const qrCodeBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
          const qrCodeBuffer = Buffer.from(qrCodeBase64, "base64");
          
          doc.image(qrCodeBuffer, pageWidth - margin - 70, pageHeight - 120, {
            width: 60,
            height: 60,
          });
          
          doc
            .fontSize(6)
            .font("Helvetica")
            .fillColor("#6B7280")
            .text("Scan to verify", pageWidth - margin - 70, pageHeight - 55, {
              width: 60,
              align: "center",
            });
        } catch (error) {
          console.error("Error adding QR code to certificate:", error);
        }
      }

      // Footer
      if (template?.footer?.customText) {
        doc
          .fontSize(8)
          .font("Helvetica-Oblique")
          .fillColor("#9CA3AF")
          .text(template.footer.customText, margin, pageHeight - 40, {
            width: contentWidth,
            align: "center",
          });
      }

      // Watermark
      if (template?.design?.showWatermark && template.design.watermarkText) {
        doc
          .fontSize(60)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .opacity(template.design.watermarkOpacity || 0.1)
          .text(template.design.watermarkText, 0, pageHeight / 2 - 50, {
            width: pageWidth,
            align: "center",
            angle: -45,
          })
          .opacity(1);
      }

      doc.end();

      stream.on("finish", () => {
        resolve({ filename, filepath });
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete certificate PDF
export const deleteCertificatePDF = (filename) => {
  try {
    const filepath = path.join(certificatesDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting certificate PDF:", error);
    return false;
  }
};

