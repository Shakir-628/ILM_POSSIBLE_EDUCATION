import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import { generateUniqueTeacherId } from "../utils/generateId.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("user", "name email")
      .populate("subjects", "subjectName subjectCode");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current teacher profile
// @route   GET /api/teachers/me
// @access  Private (Teacher)
export const getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate("user", "name email role")
      .populate("subjects", "subjectName subjectCode");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("user", "name email")
      .populate("subjects", "subjectName subjectCode");

    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res) => {
  try {
    const {
      userId,
      teacherId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      qualification,
      specialization,
      experience,
      subjects,
      joiningDate,
      salary,
      profileImage,
      password,
    } = req.body;

    // Auto-generate teacher ID if not provided
    let finalTeacherId = teacherId;
    if (!finalTeacherId) {
      finalTeacherId = await generateUniqueTeacherId();
    } else {
      // Check if manually provided teacher ID already exists
      const teacherExists = await Teacher.findOne({ teacherId: finalTeacherId });
      if (teacherExists) {
        return res.status(400).json({ message: "Teacher ID already exists" });
      }
    }

    // Check if email already exists
    const emailExists = await Teacher.findOne({ email });
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
      const defaultPassword = password || "teacher123"; // Use provided password or default
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password: defaultPassword,
        role: "teacher",
        phone,
      });

      userIdToUse = user._id;
    }

    const teacher = await Teacher.create({
      user: userIdToUse,
      teacherId: finalTeacherId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      qualification,
      specialization,
      experience,
      subjects,
      joiningDate,
      salary,
      profileImage,
    });

    // Populate user data before sending response
    await teacher.populate("user", "name email role");

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      Object.assign(teacher, req.body);
      const updatedTeacher = await teacher.save();
      res.json(updatedTeacher);
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      await teacher.deleteOne();
      res.json({ message: "Teacher removed" });
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate ID card for single teacher
// @route   GET /api/teachers/:id/id-card
// @access  Private
export const generateIDCard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Create PDF document (ID card size: 85.6mm x 54mm)
    const doc = new PDFDocument({
      size: [242.64, 153], // CR80 size in points (85.6mm x 54mm)
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=teacher_id_card_${teacher.teacherId}.pdf`
    );

    doc.pipe(res);

    // Generate QR code
    const qrData = JSON.stringify({
      id: teacher.teacherId,
      name: `${teacher.firstName} ${teacher.lastName}`,
      department: teacher.department,
      type: 'teacher'
    });
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Card Header (Blue gradient background)
    doc.rect(0, 0, 242.64, 35).fillAndStroke('#0070C0', '#0070C0');

    // School Name
    doc.fontSize(10).font('Helvetica-Bold').fillColor('white');
    doc.text('ILM Possible', 10, 8, { width: 150 });

    // ID Card Label
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('TEACHER ID', 150, 12, { align: 'right', width: 82 });

    // Photo section (if available)
    const photoX = 10;
    const photoY = 40;
    const photoWidth = 50;
    const photoHeight = 60;

    doc.rect(photoX, photoY, photoWidth, photoHeight).stroke('#CCCCCC');

    // If no photo, add placeholder
    doc.fontSize(8).fillColor('#999999');
    doc.text('PHOTO', photoX + 12, photoY + 25);

    // Teacher Details
    const detailsX = photoX + photoWidth + 10;
    const detailsY = 40;

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text(`${teacher.firstName} ${teacher.lastName}`, detailsX, detailsY, { width: 130 });

    doc.fontSize(8).font('Helvetica').fillColor('#666666');
    doc.text(teacher.qualification || 'Teacher', detailsX, detailsY + 14, { width: 130 });

    // ID and Department
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333');
    doc.text('ID:', detailsX, detailsY + 28);
    doc.font('Helvetica').fillColor('#000000');
    doc.text(teacher.teacherId, detailsX + 15, detailsY + 28);

    doc.font('Helvetica-Bold').fillColor('#333333');
    doc.text('Dept:', detailsX, detailsY + 38);
    doc.font('Helvetica').fillColor('#000000');
    doc.text(teacher.department || 'N/A', detailsX + 20, detailsY + 38, { width: 100 });

    doc.font('Helvetica-Bold').fillColor('#333333');
    doc.text('Phone:', detailsX, detailsY + 48);
    doc.font('Helvetica').fillColor('#000000');
    doc.text(teacher.phone || 'N/A', detailsX + 23, detailsY + 48);

    // QR Code
    if (qrCodeImage) {
      const qrX = 185;
      const qrY = 40;
      const qrSize = 35;

      // Add QR code image
      const qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
    }

    // Footer
    const footerY = 115;
    doc.rect(0, footerY, 242.64, 38).fillAndStroke('#F5F5F5', '#F5F5F5');

    doc.fontSize(7).font('Helvetica').fillColor('#666666');
    doc.text(`Valid: ${new Date().getFullYear()}`, 10, footerY + 5);
    doc.text('📞 +92-XXX-XXXXXXX', 10, footerY + 15, { width: 220, align: 'center' });
    doc.text('🌐 www.ilmpossible.edu.pk', 10, footerY + 24, { width: 220, align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Generate ID card error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate ID cards for multiple teachers
// @route   POST /api/teachers/bulk-id-cards
// @access  Private (Admin)
export const generateBulkIDCards = async (req, res) => {
  try {
    const { teacherIds } = req.body;

    if (!teacherIds || teacherIds.length === 0) {
      return res.status(400).json({ message: "No teacher IDs provided" });
    }

    const teachers = await Teacher.find({ _id: { $in: teacherIds } });

    if (teachers.length === 0) {
      return res.status(404).json({ message: "No teachers found" });
    }

    // Create PDF document with multiple cards (A4 size for printing)
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 }
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=teacher_id_cards_bulk_${Date.now()}.pdf`
    );

    doc.pipe(res);

    // Layout: 2 cards per row, 4 rows per page (8 cards per page)
    const cardWidth = 242.64; // CR80 width in points
    const cardHeight = 153; // CR80 height in points
    const cardsPerRow = 2;
    const rowsPerPage = 4;
    const cardSpacing = 20;
    const startX = 30;
    const startY = 30;

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const row = Math.floor(i / cardsPerRow) % rowsPerPage;
      const col = i % cardsPerRow;
      const x = startX + col * (cardWidth + cardSpacing);
      const y = startY + row * (cardHeight + cardSpacing);

      // Add new page if needed
      if (i > 0 && i % (cardsPerRow * rowsPerPage) === 0) {
        doc.addPage();
      }

      // Save current position
      doc.save();

      // Generate QR code
      const qrData = JSON.stringify({
        id: teacher.teacherId,
        name: `${teacher.firstName} ${teacher.lastName}`,
        department: teacher.department,
        type: 'teacher'
      });
      const qrCodeImage = await QRCode.toDataURL(qrData);

      // Draw card border
      doc.rect(x, y, cardWidth, cardHeight).stroke('#CCCCCC');

      // Card Header
      doc.rect(x, y, cardWidth, 35).fillAndStroke('#0070C0', '#0070C0');

      doc.fontSize(10).font('Helvetica-Bold').fillColor('white');
      doc.text('ILM Possible', x + 10, y + 8, { width: 150 });
      doc.fontSize(8).text('TEACHER ID', x + 150, y + 12, { align: 'right', width: 82 });

      // Photo placeholder
      const photoX = x + 10;
      const photoY = y + 40;
      doc.rect(photoX, photoY, 50, 60).stroke('#CCCCCC');
      doc.fontSize(8).fillColor('#999999');
      doc.text('PHOTO', photoX + 12, photoY + 25);

      // Teacher details
      const detailsX = photoX + 60;
      const detailsY = y + 40;

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
      doc.text(`${teacher.firstName} ${teacher.lastName}`, detailsX, detailsY, { width: 120 });

      doc.fontSize(8).font('Helvetica').fillColor('#666666');
      doc.text(teacher.qualification || 'Teacher', detailsX, detailsY + 14, { width: 120 });

      doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333');
      doc.text('ID:', detailsX, detailsY + 28);
      doc.font('Helvetica').fillColor('#000000');
      doc.text(teacher.teacherId, detailsX + 15, detailsY + 28);

      doc.font('Helvetica-Bold').fillColor('#333333');
      doc.text('Dept:', detailsX, detailsY + 38);
      doc.font('Helvetica').fillColor('#000000');
      doc.text(teacher.department || 'N/A', detailsX + 20, detailsY + 38, { width: 90 });

      doc.font('Helvetica-Bold').fillColor('#333333');
      doc.text('Phone:', detailsX, detailsY + 48);
      doc.font('Helvetica').fillColor('#000000');
      doc.text(teacher.phone || 'N/A', detailsX + 23, detailsY + 48);

      // QR Code
      if (qrCodeImage) {
        const qrX = x + 185;
        const qrY = y + 40;
        const qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: 35, height: 35 });
      }

      // Footer
      const footerY = y + 115;
      doc.rect(x, footerY, cardWidth, 38).fillAndStroke('#F5F5F5', '#F5F5F5');

      doc.fontSize(7).font('Helvetica').fillColor('#666666');
      doc.text(`Valid: ${new Date().getFullYear()}`, x + 10, footerY + 5);
      doc.text('📞 +92-XXX-XXXXXXX', x + 10, footerY + 15, { width: 220, align: 'center' });
      doc.text('🌐 www.ilmpossible.edu.pk', x + 10, footerY + 24, { width: 220, align: 'center' });

      // Restore position
      doc.restore();
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Generate bulk ID cards error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

