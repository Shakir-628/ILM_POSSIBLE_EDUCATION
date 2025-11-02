import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, "../uploads/invoices");
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

/**
 * Generate Fee Invoice PDF
 */
export const generateFeeInvoice = async (payment, student) => {
  return new Promise((resolve, reject) => {
    const filename = `invoice-${payment.invoiceNumber}.pdf`;
    const filepath = path.join(invoicesDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header - School Info
    doc
      .fontSize(20)
      .text("ILM POSSIBLE EDUCATION", 50, 50, { align: "center" })
      .fontSize(10)
      .text("Student Management System", { align: "center" })
      .text("Email: info@ilmpossible.com | Phone: +92-300-1234567", { align: "center" })
      .moveDown(2);

    // Invoice Title
    doc
      .fontSize(16)
      .text("FEE INVOICE", { align: "center", underline: true })
      .moveDown();

    // Invoice Details (Left Side)
    const invoiceY = doc.y;
    doc
      .fontSize(10)
      .text(`Invoice #: ${payment.invoiceNumber}`, 50, invoiceY)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .text(`Due Date: ${new Date(payment.dueDate).toLocaleDateString()}`)
      .text(`Academic Year: ${payment.academicYear}`)
      .moveDown();

    // Student Details (Right Side)
    doc
      .fontSize(10)
      .text(`Student ID: ${student.studentId}`, 350, invoiceY)
      .text(`Name: ${student.firstName} ${student.lastName}`, 350)
      .text(`Class: ${student.class?.className || "N/A"}`, 350)
      .text(`Email: ${student.email}`, 350)
      .moveDown(2);

    // Table Header
    const tableTop = doc.y;
    doc
      .fontSize(10)
      .text("Description", 50, tableTop, { bold: true })
      .text("Amount (PKR)", 400, tableTop, { align: "right" });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Content
    let yPosition = tableTop + 25;
    doc.fontSize(10);

    // Fee Amount
    doc.text(payment.feeStructure?.feeName || "Fee Payment", 50, yPosition);
    doc.text(payment.amount.toFixed(2), 400, yPosition, { align: "right" });
    yPosition += 20;

    // Late Fee (if any)
    if (payment.lateFee > 0) {
      doc.text("Late Fee", 50, yPosition);
      doc.text(payment.lateFee.toFixed(2), 400, yPosition, { align: "right" });
      yPosition += 20;
    }

    // Discount (if any)
    if (payment.discount > 0) {
      doc.text("Discount", 50, yPosition);
      doc.text(`-${payment.discount.toFixed(2)}`, 400, yPosition, { align: "right" });
      yPosition += 20;
    }

    // Line before total
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Total
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total Amount:", 50, yPosition)
      .text(`PKR ${payment.totalAmount.toFixed(2)}`, 400, yPosition, { align: "right" })
      .font("Helvetica");

    yPosition += 30;

    // Payment Status
    doc.fontSize(10);
    doc.text(`Payment Status: ${payment.paymentStatus.toUpperCase()}`, 50, yPosition);
    
    if (payment.amountPaid > 0) {
      yPosition += 20;
      doc.text(`Amount Paid: PKR ${payment.amountPaid.toFixed(2)}`, 50, yPosition);
      doc.text(`Balance: PKR ${payment.balance.toFixed(2)}`, 400, yPosition, { align: "right" });
    }

    // Footer
    doc
      .moveDown(4)
      .fontSize(8)
      .text("This is a computer-generated invoice and does not require a signature.", {
        align: "center",
      })
      .text("For queries, contact: accounts@ilmpossible.com", { align: "center" });

    // Barcode or QR code could be added here
    doc
      .moveDown()
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });

    doc.end();

    stream.on("finish", () => {
      resolve({ filename, filepath });
    });

    stream.on("error", reject);
  });
};

/**
 * Generate Fee Receipt PDF (after payment)
 */
export const generateFeeReceipt = async (payment, student) => {
  return new Promise((resolve, reject) => {
    const filename = `receipt-${payment.receiptNumber || payment.invoiceNumber}.pdf`;
    const filepath = path.join(invoicesDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc
      .fontSize(20)
      .text("ILM POSSIBLE EDUCATION", 50, 50, { align: "center" })
      .fontSize(10)
      .text("Fee Payment Receipt", { align: "center" })
      .moveDown(2);

    // Receipt Title
    doc
      .fontSize(16)
      .text("PAYMENT RECEIPT", { align: "center", underline: true })
      .moveDown();

    // Receipt Details
    const detailsY = doc.y;
    doc
      .fontSize(10)
      .text(`Receipt #: ${payment.receiptNumber || payment.invoiceNumber}`, 50, detailsY)
      .text(`Invoice #: ${payment.invoiceNumber}`)
      .text(`Payment Date: ${new Date(payment.paidDate).toLocaleDateString()}`)
      .text(`Payment Method: ${payment.paymentMethod}`)
      .moveDown();

    // Student Details
    doc
      .fontSize(10)
      .text(`Student: ${student.firstName} ${student.lastName}`, 350, detailsY)
      .text(`Student ID: ${student.studentId}`, 350)
      .text(`Class: ${student.class?.className || "N/A"}`, 350)
      .moveDown(2);

    // Payment Details Table
    const tableTop = doc.y;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Payment Details", 50, tableTop)
      .font("Helvetica")
      .moveDown();

    const paymentY = doc.y;
    doc
      .fontSize(10)
      .text("Fee Amount:", 50, paymentY)
      .text(`PKR ${payment.amount.toFixed(2)}`, 400, paymentY, { align: "right" });

    if (payment.lateFee > 0) {
      doc
        .text("Late Fee:", 50)
        .text(`PKR ${payment.lateFee.toFixed(2)}`, 400, doc.y - 12, { align: "right" });
    }

    if (payment.discount > 0) {
      doc
        .text("Discount:", 50)
        .text(`-PKR ${payment.discount.toFixed(2)}`, 400, doc.y - 12, { align: "right" });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Total Paid
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Amount Paid:", 50)
      .text(`PKR ${payment.amountPaid.toFixed(2)}`, 400, doc.y - 16, { align: "right" })
      .font("Helvetica");

    if (payment.balance > 0) {
      doc
        .fontSize(10)
        .text(`Remaining Balance: PKR ${payment.balance.toFixed(2)}`, 50);
    }

    // Thank you message
    doc
      .moveDown(3)
      .fontSize(12)
      .text("Thank you for your payment!", { align: "center" })
      .moveDown();

    // Footer
    doc
      .fontSize(8)
      .text("This is a computer-generated receipt.", { align: "center" })
      .text("For queries, contact: accounts@ilmpossible.com", { align: "center" });

    doc.end();

    stream.on("finish", () => {
      resolve({ filename, filepath });
    });

    stream.on("error", reject);
  });
};

export default {
  generateFeeInvoice,
  generateFeeReceipt,
};

