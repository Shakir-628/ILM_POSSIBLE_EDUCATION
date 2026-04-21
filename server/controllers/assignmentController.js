import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Student from "../models/Student.js";
import { processUploadedFiles } from "../services/fileService.js";

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const { classId, status } = req.query;
    const query = {};

    if (classId) query.class = classId;
    if (status) query.status = status;

    // Students only see assignments for their own class
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        query.class = student.class;
      } else {
        return res.status(404).json({ message: "Student profile not found" });
      }
    }

    const assignments = await Assignment.find(query)
      .populate("class", "className grade section")
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("class", "className grade section")
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "firstName lastName email");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Get submission count
    const submissionCount = await Submission.countDocuments({ assignment: req.params.id });

    res.json({ ...assignment.toObject(), submissionCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      classId,
      subjectId,
      teacherId,
      dueDate,
      totalMarks,
      instructions,
      status,
    } = req.body;

    // Process uploaded files
    const attachments = req.files ? processUploadedFiles(req.files) : [];

    const assignment = await Assignment.create({
      title,
      description,
      class: classId,
      subject: subjectId,
      teacher: teacherId,
      dueDate,
      totalMarks,
      attachments,
      instructions,
      status: status || "published",
    });

    await assignment.populate("class subject teacher");

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher/Admin)
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Process new uploaded files
    if (req.files) {
      const newAttachments = processUploadedFiles(req.files);
      req.body.attachments = [...(assignment.attachments || []), ...newAttachments];
    }

    Object.assign(assignment, req.body);
    const updatedAssignment = await assignment.save();

    await updatedAssignment.populate("class subject teacher");

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher/Admin)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Delete all submissions
    await Submission.deleteMany({ assignment: req.params.id });

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher/Admin)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate("student", "studentId firstName lastName email")
      .populate("gradedBy", "firstName lastName")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assignment statistics
// @route   GET /api/assignments/:id/stats
// @access  Private (Teacher/Admin)
export const getAssignmentStats = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submissions = await Submission.find({ assignment: req.params.id });

    const stats = {
      totalSubmissions: submissions.length,
      gradedSubmissions: submissions.filter((s) => s.status === "graded").length,
      pendingSubmissions: submissions.filter((s) => s.status === "submitted").length,
      lateSubmissions: submissions.filter((s) => s.status === "late").length,
      averageMarks: submissions.filter((s) => s.marks != null).reduce((sum, s) => sum + s.marks, 0) / submissions.filter((s) => s.marks != null).length || 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getAssignmentStats,
};
