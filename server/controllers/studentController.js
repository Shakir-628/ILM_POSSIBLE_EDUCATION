import Student from "../models/Student.js";
import User from "../models/User.js";
import Parent from "../models/Parent.js";
import Class from "../models/Class.js";
import { generateUniqueStudentId } from "../utils/generateId.js";
import { generateStudentQRCode, deleteQRCode } from "../services/qrcodeService.js";
import { generateStudentIDCard, generateBulkIDCards } from "../services/idCardService.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import mailService from "../services/mailService.js";

// @desc    Get my profile (for logged-in student)
// @route   GET /api/students/me
// @access  Private (Student)
export const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate("user", "name email")
      .populate("class", "className grade section")
      .populate("parent", "firstName lastName phone email");
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats for logged-in student
// @route   GET /api/students/dashboard/stats  
// @access  Private (Student)
export const getDashboardStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    
    res.json({
      studentId: student._id,
      message: "Use specific service endpoints for detailed stats"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "name email")
      .populate("class", "className grade section")
      .populate("parent", "firstName lastName phone email")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email")
      .populate("class", "className grade section")
      .populate("parent", "firstName lastName phone email relationship")
      .populate("previousClass", "className grade section")
      .populate({
        path: "promotionHistory.fromClass",
        select: "className grade section",
      })
      .populate({
        path: "promotionHistory.toClass",
        select: "className grade section",
      })
      .populate("promotionHistory.promotedBy", "name");

    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res) => {
  try {
    const {
      userId,
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      guardianName,
      guardianPhone,
      guardianEmail,
      classId,
      enrollmentDate,
      profileImage,
      password,
    } = req.body;

    // Auto-generate student ID if not provided
    let finalStudentId = studentId;
    if (!finalStudentId) {
      finalStudentId = await generateUniqueStudentId();
    } else {
      // Check if manually provided student ID already exists
      const studentExists = await Student.findOne({ studentId: finalStudentId });
      if (studentExists) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
    }

    // Check if email already exists
    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let userIdToUse = userId;

    // If no userId provided, create a user account automatically
    if (!userId) {
      // Check if user with this email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create user account
      const defaultPassword = password || "student123"; // Use provided password or default
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password: defaultPassword,
        role: "student",
        phone,
      });

      userIdToUse = user._id;

      // Send welcome email with credentials
      try {
        await mailService.sendWelcomeEmail(email, `${firstName} ${lastName}`, defaultPassword, "student");
      } catch (mailError) {
        console.error("Welcome email failed:", mailError);
        // Don't fail the whole request if email fails
      }
    }

    const student = await Student.create({
      user: userIdToUse,
      studentId: finalStudentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      guardianName,
      guardianPhone,
      guardianEmail,
      class: classId,
      enrollmentDate,
      profileImage,
    });

    // Generate QR Code for student
    try {
      const classData = classId ? await Class.findById(classId) : null;
      const qrCodePath = await generateStudentQRCode(finalStudentId, {
        name: `${firstName} ${lastName}`,
        class: classData ? `${classData.className} - ${classData.grade}` : "",
      });
      student.qrCode = qrCodePath;
      await student.save();
    } catch (qrError) {
      console.error("QR Code generation failed:", qrError);
      // Continue even if QR code generation fails
    }

    // Populate user data before sending response
    await student.populate("user", "name email role");
    await student.populate("class", "className grade section");

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      Object.assign(student, req.body);
      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      await student.deleteOne();
      res.json({ message: "Student removed" });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students by class
// @route   GET /api/students/class/:classId
// @access  Private
export const getStudentsByClass = async (req, res) => {
  try {
    // Security: Students can only list students in their own class
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student || student.class.toString() !== req.params.classId) {
        return res.status(403).json({ message: "Access denied. You can only view students in your own class." });
      }
    }

    const students = await Student.find({ class: req.params.classId })
      .populate("user", "name email")
      .populate("class", "className grade section");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get information about the student's own class and teachers
// @route   GET /api/students/me/class-info
// @access  Private (Student)
export const getMyClassInfo = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student || !student.class) {
      return res.status(404).json({ message: "Student class information not found" });
    }

    const classData = await Class.findById(student.class)
      .populate("classTeacher", "firstName lastName email phone profileImage")
      .populate({
        path: "subjects",
        populate: {
          path: "teacher",
          select: "firstName lastName email phone profileImage specialization"
        }
      });

    if (!classData) {
      return res.status(404).json({ message: "Class details not found" });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload document for student
// @route   POST /api/students/:id/documents
// @access  Private (Admin)
export const uploadDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { documentType } = req.body;

    const document = {
      documentType: documentType || "other",
      filename: req.file.filename,
      path: `/uploads/documents/${req.file.filename}`,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
    };

    student.documents.push(document);
    await student.save();

    res.status(200).json(student);
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/students/:id/documents/:documentId
// @access  Private (Admin)
export const deleteDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const document = student.documents.id(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    student.documents.pull(req.params.documentId);
    await student.save();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promote student to next class
// @route   POST /api/students/:id/promote
// @access  Private (Admin)
export const promoteStudent = async (req, res) => {
  try {
    const { toClassId, academicYear } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const toClass = await Class.findById(toClassId);
    if (!toClass) {
      return res.status(404).json({ message: "Target class not found" });
    }

    // Add to promotion history
    const promotion = {
      fromClass: student.class,
      toClass: toClassId,
      promotionDate: new Date(),
      academicYear: academicYear || new Date().getFullYear().toString(),
      promotedBy: req.user._id,
    };

    student.promotionHistory.push(promotion);
    student.previousClass = student.class;
    student.class = toClassId;

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate("class", "className grade section")
      .populate("previousClass", "className grade section")
      .populate({
        path: "promotionHistory.fromClass",
        select: "className grade section",
      })
      .populate({
        path: "promotionHistory.toClass",
        select: "className grade section",
      })
      .populate("promotionHistory.promotedBy", "name");

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Promote student error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Transfer student
// @route   POST /api/students/:id/transfer
// @access  Private (Admin)
export const transferStudent = async (req, res) => {
  try {
    const { toSchool, reason } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Add to transfer history
    const transfer = {
      fromSchool: "Current School", // You can customize this
      toSchool,
      transferDate: new Date(),
      reason,
      transferredBy: req.user._id,
    };

    student.transferHistory.push(transfer);
    student.status = "transferred";

    await student.save();

    res.status(200).json(student);
  } catch (error) {
    console.error("Transfer student error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export students to Excel
// @route   GET /api/students/export/excel
// @access  Private (Admin)
export const exportToExcel = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("class", "className grade section")
      .populate("parent", "firstName lastName phone");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Define columns
    worksheet.columns = [
      { header: "Student ID", key: "studentId", width: 15 },
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Date of Birth", key: "dateOfBirth", width: 15 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Class", key: "class", width: 20 },
      { header: "Parent Name", key: "parentName", width: 20 },
      { header: "Parent Phone", key: "parentPhone", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Enrollment Date", key: "enrollmentDate", width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };

    // Add data
    students.forEach((student) => {
      worksheet.addRow({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "",
        gender: student.gender,
        email: student.email,
        phone: student.phone,
        class: student.class ? `${student.class.className} - ${student.class.grade}` : "N/A",
        parentName: student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : "N/A",
        parentPhone: student.parent?.phone || "N/A",
        status: student.status,
        enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "",
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export to Excel error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export students to PDF
// @route   GET /api/students/export/pdf
// @access  Private (Admin)
export const exportToPDF = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("class", "className grade section")
      .populate("parent", "firstName lastName phone");

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=students.pdf");

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text("Student List", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    // Table header
    const tableTop = 150;
    const col1X = 50;
    const col2X = 120;
    const col3X = 220;
    const col4X = 320;
    const col5X = 420;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Student ID", col1X, tableTop);
    doc.text("Name", col2X, tableTop);
    doc.text("Class", col3X, tableTop);
    doc.text("Email", col4X, tableTop);
    doc.text("Status", col5X, tableTop);

    // Draw line
    doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font("Helvetica").fontSize(9);

    students.forEach((student, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(student.studentId, col1X, y, { width: 60 });
      doc.text(`${student.firstName} ${student.lastName}`, col2X, y, { width: 90 });
      doc.text(student.class ? `${student.class.className}` : "N/A", col3X, y, { width: 90 });
      doc.text(student.email, col4X, y, { width: 90 });
      doc.text(student.status, col5X, y, { width: 70 });

      y += 25;
    });

    // Footer
    doc.fontSize(8).text(
      `Total Students: ${students.length}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Export to PDF error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate ID card for single student
// @route   GET /api/students/:id/id-card
// @access  Private (Admin)
export const generateIDCard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("class", "className grade section");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create ID cards directory if it doesn't exist
    const idCardsDir = path.join(process.cwd(), "uploads", "id-cards");
    if (!fs.existsSync(idCardsDir)) {
      fs.mkdirSync(idCardsDir, { recursive: true });
    }

    const filename = `${student.studentId}_id_card.pdf`;
    const filepath = path.join(idCardsDir, filename);

    await generateStudentIDCard(student, filepath);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Send file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on("end", () => {
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }, 1000);
    });
  } catch (error) {
    console.error("Generate ID card error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate ID cards for multiple students
// @route   POST /api/students/bulk-id-cards
// @access  Private (Admin)
export const generateBulkIDCardsController = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Student IDs array is required" });
    }

    const students = await Student.find({ _id: { $in: studentIds } })
      .populate("class", "className grade section");

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    // Create ID cards directory if it doesn't exist
    const idCardsDir = path.join(process.cwd(), "uploads", "id-cards");
    if (!fs.existsSync(idCardsDir)) {
      fs.mkdirSync(idCardsDir, { recursive: true });
    }

    const filename = `bulk_id_cards_${Date.now()}.pdf`;
    const filepath = path.join(idCardsDir, filename);

    await generateBulkIDCards(students, filepath);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Send file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Clean up file after sending
    fileStream.on("end", () => {
      setTimeout(() => {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }, 1000);
    });
  } catch (error) {
    console.error("Generate bulk ID cards error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Excel template for bulk import
// @route   GET /api/students/import/template
// @access  Private (Admin)
export const downloadImportTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students Template");

    // Define columns
    worksheet.columns = [
      { header: "First Name*", key: "firstName", width: 15 },
      { header: "Last Name*", key: "lastName", width: 15 },
      { header: "Email*", key: "email", width: 25 },
      { header: "Phone*", key: "phone", width: 15 },
      { header: "Date of Birth* (YYYY-MM-DD)", key: "dateOfBirth", width: 20 },
      { header: "Gender* (male/female/other)", key: "gender", width: 20 },
      { header: "Guardian Name*", key: "guardianName", width: 20 },
      { header: "Guardian Phone*", key: "guardianPhone", width: 15 },
      { header: "Guardian Email", key: "guardianEmail", width: 25 },
      { header: "Class ID (MongoDB ID)", key: "classId", width: 25 },
      { header: "Street Address", key: "street", width: 30 },
      { header: "City", key: "city", width: 15 },
      { header: "State", key: "state", width: 15 },
      { header: "Blood Group", key: "bloodGroup", width: 12 },
      { header: "Enrollment Date (YYYY-MM-DD)", key: "enrollmentDate", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0369A1" },
    };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    // Add sample data
    worksheet.addRow({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "03001234567",
      dateOfBirth: "2010-05-15",
      gender: "male",
      guardianName: "Jane Doe",
      guardianPhone: "03001234568",
      guardianEmail: "jane.doe@example.com",
      classId: "65a1b2c3d4e5f6g7h8i9j0k1",
      street: "123 Main Street",
      city: "Karachi",
      state: "Sindh",
      bloodGroup: "O+",
      enrollmentDate: "2024-01-01",
    });

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet("Instructions");
    instructionsSheet.getColumn(1).width = 80;
    
    instructionsSheet.addRow(["STUDENT BULK IMPORT INSTRUCTIONS"]);
    instructionsSheet.getRow(1).font = { bold: true, size: 14 };
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(["Required Fields (marked with *):"]);
    instructionsSheet.addRow(["- First Name, Last Name, Email, Phone"]);
    instructionsSheet.addRow(["- Date of Birth (format: YYYY-MM-DD)"]);
    instructionsSheet.addRow(["- Gender (must be: male, female, or other)"]);
    instructionsSheet.addRow(["- Guardian Name and Phone"]);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(["Optional Fields:"]);
    instructionsSheet.addRow(["- Guardian Email, Class ID, Address fields, Blood Group, Enrollment Date"]);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(["Important Notes:"]);
    instructionsSheet.addRow(["1. Email addresses must be unique"]);
    instructionsSheet.addRow(["2. Student IDs will be auto-generated"]);
    instructionsSheet.addRow(["3. User accounts will be created automatically (password: student123)"]);
    instructionsSheet.addRow(["4. QR codes will be generated for each student"]);
    instructionsSheet.addRow(["5. Date format must be YYYY-MM-DD (e.g., 2010-05-15)"]);
    instructionsSheet.addRow(["6. Class ID must be a valid MongoDB ObjectId (get from Classes page)"]);
    instructionsSheet.addRow(["7. Phone numbers should be in format: 03001234567"]);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(["Steps:"]);
    instructionsSheet.addRow(["1. Fill in the 'Students Template' sheet with your data"]);
    instructionsSheet.addRow(["2. Remove the sample row"]);
    instructionsSheet.addRow(["3. Save the file"]);
    instructionsSheet.addRow(["4. Upload on the Bulk Import page"]);
    instructionsSheet.addRow(["5. Review preview and errors"]);
    instructionsSheet.addRow(["6. Click 'Import' to add students"]);

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_import_template.xlsx"
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk import students from Excel
// @route   POST /api/students/import
// @access  Private (Admin)
export const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet("Students Template");

    if (!worksheet) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Invalid template. Please use the provided template.",
      });
    }

    const students = [];
    const errors = [];
    const existingEmails = new Set();

    // Get existing emails
    const allStudents = await Student.find().select("email");
    allStudents.forEach((s) => existingEmails.add(s.email.toLowerCase()));

    // Helper function to extract cell value as string
    const getCellValue = (cell) => {
      const value = cell.value;
      if (!value) return '';
      
      // Handle hyperlink objects
      if (typeof value === 'object' && value.text) {
        return value.text.toString().trim();
      }
      
      // Handle rich text objects
      if (typeof value === 'object' && value.richText) {
        return value.richText.map(rt => rt.text).join('').trim();
      }
      
      // Handle regular values
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().trim();
      }
      
      return '';
    };

    // Parse rows (skip header)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      if (rowNumber === 2 && getCellValue(row.getCell(1)) === "John") return; // Skip sample

      const rowData = {
        firstName: getCellValue(row.getCell(1)),
        lastName: getCellValue(row.getCell(2)),
        email: getCellValue(row.getCell(3)),
        phone: getCellValue(row.getCell(4)),
        dateOfBirth: row.getCell(5).value,
        gender: getCellValue(row.getCell(6)),
        guardianName: getCellValue(row.getCell(7)),
        guardianPhone: getCellValue(row.getCell(8)),
        guardianEmail: getCellValue(row.getCell(9)),
        classId: getCellValue(row.getCell(10)),
        street: getCellValue(row.getCell(11)),
        city: getCellValue(row.getCell(12)),
        state: getCellValue(row.getCell(13)),
        bloodGroup: getCellValue(row.getCell(14)),
        enrollmentDate: row.getCell(15).value,
        rowNumber,
      };

      // Skip empty rows
      if (!rowData.firstName && !rowData.lastName && !rowData.email) {
        return;
      }

      // Validate required fields
      const rowErrors = [];
      if (!rowData.firstName) rowErrors.push("First Name is required");
      if (!rowData.lastName) rowErrors.push("Last Name is required");
      if (!rowData.email) rowErrors.push("Email is required");
      if (!rowData.phone) rowErrors.push("Phone is required");
      if (!rowData.dateOfBirth) rowErrors.push("Date of Birth is required");
      if (!rowData.gender) rowErrors.push("Gender is required");
      if (!rowData.guardianName) rowErrors.push("Guardian Name is required");
      if (!rowData.guardianPhone) rowErrors.push("Guardian Phone is required");

      // Validate gender
      if (
        rowData.gender &&
        !["male", "female", "other"].includes(rowData.gender.toLowerCase())
      ) {
        rowErrors.push("Gender must be male, female, or other");
      }

      // Validate email format
      if (rowData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(rowData.email)) {
          rowErrors.push("Invalid email format");
        } else {
          // Check duplicate email
          const emailLower = rowData.email.toLowerCase();
          if (existingEmails.has(emailLower)) {
            rowErrors.push("Email already exists in database");
          } else {
            existingEmails.add(emailLower);
          }
        }
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          data: rowData,
          errors: rowErrors,
        });
      } else {
        students.push(rowData);
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return validation results
    res.status(200).json({
      success: true,
      message: `Parsed ${students.length} valid students, ${errors.length} errors found`,
      data: {
        validCount: students.length,
        errorCount: errors.length,
        students,
        errors,
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm and execute bulk import
// @route   POST /api/students/import/confirm
// @access  Private (Admin)
export const confirmBulkImport = async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students data provided" });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const studentData of students) {
      try {
        // Generate student ID
        const studentId = await generateUniqueStudentId();

        // Create user account
        const hashedPassword = await bcrypt.hash("student123", 10);
        const user = await User.create({
          name: `${studentData.firstName} ${studentData.lastName}`,
          email: studentData.email,
          password: hashedPassword,
          role: "student",
          phone: studentData.phone,
        });

        // Create student record
        const student = await Student.create({
          user: user._id,
          studentId,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender.toLowerCase(),
          email: studentData.email,
          phone: studentData.phone,
          address: {
            street: studentData.street || "",
            city: studentData.city || "",
            state: studentData.state || "",
            country: "Pakistan",
          },
          guardianName: studentData.guardianName,
          guardianPhone: studentData.guardianPhone,
          guardianEmail: studentData.guardianEmail || "",
          class: studentData.classId || null,
          bloodGroup: studentData.bloodGroup || "",
          enrollmentDate: studentData.enrollmentDate || new Date(),
          status: "active",
        });

        // Generate QR Code
        try {
          const classData = studentData.classId
            ? await Class.findById(studentData.classId)
            : null;
          const qrCodePath = await generateStudentQRCode(studentId, {
            name: `${studentData.firstName} ${studentData.lastName}`,
            class: classData
              ? `${classData.className} - ${classData.grade}`
              : "",
          });
          student.qrCode = qrCodePath;
          await student.save();
        } catch (qrError) {
          console.error("QR Code generation failed:", qrError);
        }

        results.success.push({
          studentId,
          name: `${studentData.firstName} ${studentData.lastName}`,
          email: studentData.email,
        });
      } catch (error) {
        results.failed.push({
          name: `${studentData.firstName} ${studentData.lastName}`,
          email: studentData.email,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} students, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Confirm import error:", error);
    res.status(500).json({ message: error.message });
  }
};

