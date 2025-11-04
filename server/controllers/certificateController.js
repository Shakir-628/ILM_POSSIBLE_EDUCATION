import Certificate from "../models/Certificate.js";
import CertificateTemplate from "../models/CertificateTemplate.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import { generateCertificatePDF, deleteCertificatePDF } from "../services/certificateService.js";
import { sendCertificateNotificationEmail } from "../services/mailService.js";

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private (Admin, Teacher)
export const getCertificates = async (req, res) => {
  try {
    const { certificateType, status, studentId } = req.query;
    
    let query = {};
    if (certificateType) query.certificateType = certificateType;
    if (status) query.status = status;
    if (studentId) query.student = studentId;
    
    const certificates = await Certificate.find(query)
      .populate("student", "studentId firstName lastName email class")
      .populate("class", "className grade section")
      .populate("template", "templateName")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("student", "studentId firstName lastName email phone dateOfBirth gender guardianName class")
      .populate("class", "className grade section")
      .populate("template")
      .populate("issuedBy", "name email");
    
    if (certificate) {
      res.json(certificate);
    } else {
      res.status(404).json({ message: "Certificate not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificates by student
// @route   GET /api/certificates/student/:studentId
// @access  Private
export const getCertificatesByStudent = async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      student: req.params.studentId,
      status: { $ne: "cancelled" }
    })
      .populate("class", "className grade section")
      .populate("template", "templateName")
      .populate("issuedBy", "name")
      .sort({ issueDate: -1 });
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new certificate
// @route   POST /api/certificates
// @access  Private (Admin)
export const createCertificate = async (req, res) => {
  try {
    const {
      studentId,
      certificateType,
      title,
      content,
      additionalDetails,
      templateId,
      signatures,
      issueDate,
    } = req.body;
    
    // Validate student
    const student = await Student.findById(studentId).populate("class");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Get template if provided
    let template = null;
    if (templateId) {
      template = await CertificateTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
    } else {
      // Try to get default template for this certificate type
      template = await CertificateTemplate.findOne({
        certificateType,
        isDefault: true,
        isActive: true,
      });
    }
    
    // Create certificate
    const certificate = new Certificate({
      certificateNumber: "AUTO", // Will be auto-generated
      certificateType,
      student: studentId,
      class: student.class?._id,
      title,
      content,
      additionalDetails,
      template: template?._id,
      signatures,
      issueDate: issueDate || new Date(),
      issuedBy: req.user.id,
    });
    
    await certificate.save();
    
    // Populate fields for response
    await certificate.populate("student", "studentId firstName lastName email");
    await certificate.populate("class", "className grade section");
    await certificate.populate("template", "templateName");
    
    res.status(201).json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Private (Admin)
export const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    // Don't allow updating issued certificates
    if (certificate.status === "issued") {
      return res.status(400).json({ 
        message: "Cannot update issued certificate. Please create a new one or cancel this certificate." 
      });
    }
    
    const {
      title,
      content,
      additionalDetails,
      signatures,
      issueDate,
      status,
    } = req.body;
    
    if (title) certificate.title = title;
    if (content) certificate.content = content;
    if (additionalDetails) certificate.additionalDetails = additionalDetails;
    if (signatures) certificate.signatures = signatures;
    if (issueDate) certificate.issueDate = issueDate;
    if (status) certificate.status = status;
    
    await certificate.save();
    
    // Populate fields for response
    await certificate.populate("student", "studentId firstName lastName email");
    await certificate.populate("class", "className grade section");
    await certificate.populate("template", "templateName");
    
    res.json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Generate certificate PDF
// @route   POST /api/certificates/:id/generate
// @access  Private (Admin)
export const generateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("student", "studentId firstName lastName dateOfBirth gender guardianName")
      .populate("class", "className grade section")
      .populate("template");
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    // Generate PDF
    const { filename, filepath } = await generateCertificatePDF(
      certificate,
      certificate.student,
      certificate.template
    );
    
    // Update certificate with PDF path and status
    certificate.pdfPath = filename;
    if (certificate.status === "draft") {
      certificate.status = "issued";
    }
    await certificate.save();
    
    // Send email notification to student
    try {
      if (certificate.student.email) {
        await sendCertificateNotificationEmail(certificate.student.email, {
          studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
          certificateNumber: certificate.certificateNumber,
          certificateType: certificate.certificateType,
          issueDate: certificate.issueDate,
          verificationCode: certificate.verificationCode,
        });
      }
    } catch (emailError) {
      console.error("Error sending certificate email:", emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      message: "Certificate generated successfully",
      certificate,
      downloadUrl: `/uploads/certificates/${filename}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download certificate
// @route   GET /api/certificates/:id/download
// @access  Private
export const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    if (!certificate.pdfPath) {
      return res.status(400).json({ message: "Certificate PDF not generated yet" });
    }
    
    // Update download tracking
    certificate.downloadCount += 1;
    certificate.lastDownloadedAt = new Date();
    await certificate.save();
    
    res.json({
      downloadUrl: `/uploads/certificates/${certificate.pdfPath}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel certificate
// @route   PUT /api/certificates/:id/cancel
// @access  Private (Admin)
export const cancelCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    if (certificate.status === "cancelled") {
      return res.status(400).json({ message: "Certificate is already cancelled" });
    }
    
    const { reason } = req.body;
    
    certificate.status = "cancelled";
    certificate.cancelledBy = req.user.id;
    certificate.cancellationReason = reason || "No reason provided";
    certificate.cancellationDate = new Date();
    
    await certificate.save();
    
    res.json({
      message: "Certificate cancelled successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:verificationCode
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      verificationCode: req.params.verificationCode 
    })
      .populate("student", "studentId firstName lastName")
      .populate("class", "className grade section")
      .select("-__v");
    
    if (!certificate) {
      return res.status(404).json({ 
        message: "Certificate not found",
        valid: false,
      });
    }
    
    if (certificate.status === "cancelled") {
      return res.json({
        message: "This certificate has been cancelled",
        valid: false,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          status: certificate.status,
          cancellationReason: certificate.cancellationReason,
        },
      });
    }
    
    if (certificate.status === "expired") {
      return res.json({
        message: "This certificate has expired",
        valid: false,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          status: certificate.status,
          expiryDate: certificate.expiryDate,
        },
      });
    }
    
    res.json({
      message: "Certificate is valid",
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        certificateType: certificate.certificateType,
        studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
        studentId: certificate.student.studentId,
        className: certificate.class?.className,
        issueDate: certificate.issueDate,
        status: certificate.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Admin)
export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    // Delete PDF file if exists
    if (certificate.pdfPath) {
      deleteCertificatePDF(certificate.pdfPath);
    }
    
    await certificate.deleteOne();
    
    res.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificate statistics
// @route   GET /api/certificates/stats
// @access  Private (Admin)
export const getCertificateStats = async (req, res) => {
  try {
    const totalCertificates = await Certificate.countDocuments();
    const issuedCertificates = await Certificate.countDocuments({ status: "issued" });
    const draftCertificates = await Certificate.countDocuments({ status: "draft" });
    const cancelledCertificates = await Certificate.countDocuments({ status: "cancelled" });
    
    const certificatesByType = await Certificate.aggregate([
      {
        $group: {
          _id: "$certificateType",
          count: { $sum: 1 },
        },
      },
    ]);
    
    const recentCertificates = await Certificate.find({ status: "issued" })
      .populate("student", "firstName lastName studentId")
      .sort({ issueDate: -1 })
      .limit(5);
    
    res.json({
      total: totalCertificates,
      issued: issuedCertificates,
      draft: draftCertificates,
      cancelled: cancelledCertificates,
      byType: certificatesByType,
      recent: recentCertificates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

