import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import { processUploadedFiles } from "../services/fileService.js";
import { sendGradeNotification } from "../services/mailService.js";

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (req, res) => {
  try {
    const { studentId, assignmentId, status } = req.query;
    const query = {};

    if (studentId) query.student = studentId;
    if (assignmentId) query.assignment = assignmentId;
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate("assignment", "title dueDate totalMarks")
      .populate("student", "studentId firstName lastName email")
      .populate("gradedBy", "firstName lastName")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("assignment", "title description dueDate totalMarks attachments")
      .populate("student", "studentId firstName lastName email")
      .populate("gradedBy", "firstName lastName");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create submission (Student submits assignment)
// @route   POST /api/submissions
// @access  Private (Student)
export const createSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId, comments } = req.body;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "Assignment already submitted" });
    }

    // Check if past due date
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    // Process uploaded files
    const files = req.files ? processUploadedFiles(req.files) : [];

    if (files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one file" });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      files,
      status: isLate ? "late" : "submitted",
      submittedAt: now,
      comments,
    });

    await submission.populate("assignment student");

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update submission (Resubmit)
// @route   PUT /api/submissions/:id
// @access  Private (Student)
export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Only allow resubmission if not graded
    if (submission.status === "graded") {
      return res.status(400).json({ message: "Cannot update graded submission" });
    }

    // Process new files
    if (req.files) {
      const newFiles = processUploadedFiles(req.files);
      submission.files = [...submission.files, ...newFiles];
    }

    if (req.body.comments) {
      submission.comments = req.body.comments;
    }

    submission.status = "resubmitted";
    submission.submittedAt = new Date();

    const updatedSubmission = await submission.save();
    await updatedSubmission.populate("assignment student");

    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher/Admin)
export const gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback, teacherId } = req.body;

    const submission = await Submission.findById(req.params.id)
      .populate("assignment", "title totalMarks")
      .populate("student", "firstName lastName email");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const totalMarks = submission.assignment.totalMarks || 100;

    if (marks < 0 || marks > totalMarks) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${totalMarks}`,
      });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.gradedBy = teacherId;
    submission.gradedAt = new Date();
    submission.status = "graded";

    const updatedSubmission = await submission.save();
    await updatedSubmission.populate("gradedBy", "firstName lastName");

    // Send email notification
    try {
      await sendGradeNotification(
        submission.student.email,
        submission.assignment.title,
        marks,
        totalMarks,
        `${submission.student.firstName} ${submission.student.lastName}`
      );
    } catch (emailError) {
      console.error("Failed to send grade notification:", emailError);
    }

    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Student/Admin)
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Only allow deletion if not graded
    if (submission.status === "graded") {
      return res.status(400).json({ message: "Cannot delete graded submission" });
    }

    await submission.deleteOne();
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's submissions
// @route   GET /api/submissions/student/:studentId
// @access  Private
export const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.params.studentId })
      .populate("assignment", "title dueDate totalMarks class")
      .populate("gradedBy", "firstName lastName")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission,
  getStudentSubmissions,
};
