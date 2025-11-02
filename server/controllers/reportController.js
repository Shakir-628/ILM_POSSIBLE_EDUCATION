import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Grade from "../models/Grade.js";
import Class from "../models/Class.js";
import {
  generateStudentsExcel,
  generateAttendanceExcel,
  generateStudentPDF,
  generateClassPerformanceExcel,
} from "../services/reportService.js";
import path from "path";

// @desc    Export students list (Excel)
// @route   GET /api/reports/students
// @access  Private (Admin/Teacher)
export const exportStudents = async (req, res) => {
  try {
    const { classId, status } = req.query;
    const query = {};

    if (classId) query.class = classId;
    if (status) query.status = status;

    const students = await Student.find(query).populate("class", "className grade section");

    const { filename, filepath } = await generateStudentsExcel(students);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export attendance report (Excel)
// @route   GET /api/reports/attendance
// @access  Private (Admin/Teacher)
export const exportAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({ message: "Class ID and date are required" });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      class: classId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("student", "studentId firstName lastName")
      .populate("markedBy", "name");

    const { filename, filepath } = await generateAttendanceExcel(
      attendanceRecords,
      classData.className,
      date
    );

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate student report card (PDF)
// @route   GET /api/reports/student/:id
// @access  Private
export const generateStudentReport = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("class", "className");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get attendance records
    const attendance = await Attendance.find({ student: req.params.id });

    // Get grades
    const grades = await Grade.find({ student: req.params.id }).populate("subject", "name");

    const { filename, filepath } = await generateStudentPDF(student, attendance, grades);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export class performance (Excel)
// @route   GET /api/reports/class/:id/performance
// @access  Private (Admin/Teacher)
export const exportClassPerformance = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const students = await Student.find({ class: req.params.id });
    const grades = await Grade.find({ class: req.params.id }).populate("student subject");

    const { filename, filepath } = await generateClassPerformanceExcel(
      classData,
      students,
      grades
    );

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private (Admin)
export const getReportStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: "active" });
    const totalClasses = await Class.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today },
    });

    const presentToday = await Attendance.countDocuments({
      date: { $gte: today },
      status: "present",
    });

    const attendanceRate = todayAttendance > 0 ? ((presentToday / todayAttendance) * 100).toFixed(2) : 0;

    const stats = {
      totalStudents,
      totalClasses,
      todayAttendance: {
        total: todayAttendance,
        present: presentToday,
        absent: todayAttendance - presentToday,
        rate: attendanceRate,
      },
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  exportStudents,
  exportAttendance,
  generateStudentReport,
  exportClassPerformance,
  getReportStats,
};

