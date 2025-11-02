import Admission from "../models/Admission.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Class from "../models/Class.js";
import { generateUniqueStudentId } from "../utils/generateId.js";
import { generateStudentQRCode } from "../services/qrcodeService.js";

// @desc    Submit new admission application
// @route   POST /api/admissions
// @access  Public
export const submitApplication = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      submittedBy: req.user?._id, // Optional if public form
      submittedAt: new Date(),
    };

    const admission = await Admission.create(applicationData);

    // Populate class details
    await admission.populate("appliedForClass", "className grade section");

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: admission,
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all applications
// @route   GET /api/admissions
// @access  Private (Admin)
export const getAllApplications = async (req, res) => {
  try {
    const { status, academicYear, classId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    if (classId) filter.appliedForClass = classId;

    const applications = await Admission.find(filter)
      .populate("appliedForClass", "className grade section")
      .populate("reviewedBy", "name")
      .populate("enrolledStudent", "studentId firstName lastName")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single application
// @route   GET /api/admissions/:id
// @access  Private
export const getApplicationById = async (req, res) => {
  try {
    const application = await Admission.findById(req.params.id)
      .populate("appliedForClass", "className grade section")
      .populate("reviewedBy", "name email")
      .populate("enrolledStudent", "studentId firstName lastName email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update application
// @route   PUT /api/admissions/:id
// @access  Private (Admin)
export const updateApplication = async (req, res) => {
  try {
    const application = await Admission.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const updatedApplication = await Admission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("appliedForClass", "className grade section")
      .populate("reviewedBy", "name");

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Review application (Approve/Reject)
// @route   POST /api/admissions/:id/review
// @access  Private (Admin)
export const reviewApplication = async (req, res) => {
  try {
    const { status, reviewComments } = req.body;

    const application = await Admission.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;
    application.reviewComments = reviewComments;
    application.reviewedBy = req.user._id;
    application.reviewDate = new Date();

    await application.save();

    await application.populate("appliedForClass", "className grade section");
    await application.populate("reviewedBy", "name");

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    console.error("Review application error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update test/interview scores
// @route   POST /api/admissions/:id/scores
// @access  Private (Admin)
export const updateScores = async (req, res) => {
  try {
    const { entranceTestScore, interviewScore, entranceTestDate, interviewDate } = req.body;

    const application = await Admission.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (entranceTestScore !== undefined) {
      application.entranceTestScore = entranceTestScore;
      application.entranceTestDate = entranceTestDate || new Date();
    }

    if (interviewScore !== undefined) {
      application.interviewScore = interviewScore;
      application.interviewDate = interviewDate || new Date();
    }

    // Calculate total merit score (40% test + 40% interview + 20% previous grades)
    const testScore = application.entranceTestScore || 0;
    const intScore = application.interviewScore || 0;
    const prevGrade = parseFloat(application.previousSchool?.lastGrade) || 0;

    application.totalMeritScore = (testScore * 0.4) + (intScore * 0.4) + (prevGrade * 0.2);

    await application.save();

    res.status(200).json({
      success: true,
      message: "Scores updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Update scores error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate merit list
// @route   GET /api/admissions/merit-list/:classId
// @access  Private (Admin)
export const generateMeritList = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    const filter = {
      appliedForClass: classId,
      status: { $in: ["approved", "under-review"] },
      totalMeritScore: { $exists: true, $ne: null },
    };

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    // Get applications and sort by merit score
    const applications = await Admission.find(filter)
      .populate("appliedForClass", "className grade section")
      .sort({ totalMeritScore: -1 });

    // Assign merit ranks
    for (let i = 0; i < applications.length; i++) {
      applications[i].meritRank = i + 1;
      await applications[i].save();
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Generate merit list error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Enroll student from application
// @route   POST /api/admissions/:id/enroll
// @access  Private (Admin)
export const enrollStudent = async (req, res) => {
  try {
    const application = await Admission.findById(req.params.id)
      .populate("appliedForClass");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Application must be approved before enrollment",
      });
    }

    if (application.enrolledStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already enrolled",
      });
    }

    // Generate student ID
    const studentId = await generateUniqueStudentId();

    // Create user account
    const user = await User.create({
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      password: "student123", // Default password
      role: "student",
      phone: application.phone,
    });

    // Create student record
    const student = await Student.create({
      user: user._id,
      studentId,
      firstName: application.firstName,
      lastName: application.lastName,
      dateOfBirth: application.dateOfBirth,
      gender: application.gender,
      email: application.email,
      phone: application.phone,
      address: application.address,
      guardianName: application.fatherName,
      guardianPhone: application.fatherPhone,
      guardianEmail: application.fatherEmail,
      class: application.appliedForClass._id,
      enrollmentDate: new Date(),
      status: "active",
    });

    // Generate QR Code
    try {
      const qrCodePath = await generateStudentQRCode(studentId, {
        name: `${application.firstName} ${application.lastName}`,
        class: `${application.appliedForClass.className} - ${application.appliedForClass.grade}`,
      });
      student.qrCode = qrCodePath;
      await student.save();
    } catch (qrError) {
      console.error("QR Code generation failed:", qrError);
    }

    // Update admission record
    application.status = "enrolled";
    application.enrolledStudent = student._id;
    application.enrollmentDate = new Date();
    await application.save();

    res.status(200).json({
      success: true,
      message: "Student enrolled successfully",
      data: {
        application,
        student,
      },
    });
  } catch (error) {
    console.error("Enroll student error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/admissions/:id
// @access  Private (Admin)
export const deleteApplication = async (req, res) => {
  try {
    const application = await Admission.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload document for application
// @route   POST /api/admissions/:id/documents
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    const application = await Admission.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { documentType } = req.body;

    const document = {
      documentType: documentType || "other",
      filename: req.file.filename,
      path: `/uploads/documents/${req.file.filename}`,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
    };

    application.documents.push(document);
    await application.save();

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: application,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admission statistics
// @route   GET /api/admissions/stats
// @access  Private (Admin)
export const getAdmissionStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = academicYear ? { academicYear } : {};

    const stats = {
      total: await Admission.countDocuments(filter),
      pending: await Admission.countDocuments({ ...filter, status: "pending" }),
      underReview: await Admission.countDocuments({ ...filter, status: "under-review" }),
      approved: await Admission.countDocuments({ ...filter, status: "approved" }),
      rejected: await Admission.countDocuments({ ...filter, status: "rejected" }),
      enrolled: await Admission.countDocuments({ ...filter, status: "enrolled" }),
      withdrawn: await Admission.countDocuments({ ...filter, status: "withdrawn" }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

