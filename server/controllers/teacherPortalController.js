import Teacher from "../models/Teacher.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Grade from "../models/Grade.js";
import Assignment from "../models/Assignment.js";
import Announcement from "../models/Announcement.js";
import Timetable from "../models/Timetable.js";

// @desc    Get teacher dashboard statistics
// @route   GET /api/teacher/dashboard-stats
// @access  Private (Teacher)
export const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    // Get classes assigned to this teacher
    const classes = await Class.find({ classTeacher: teacher._id });
    const classIds = classes.map(c => c._id);

    // Total students in teacher's classes
    const totalStudents = classes.reduce((sum, c) => sum + (c.students ? c.students.length : 0), 0);

    // Pending grades (simplified: count of students without grades for recent assignments)
    // For now, let's just return some dummy counts or based on actual models
    const pendingGrades = await Grade.countDocuments({ markedBy: req.user._id, status: "pending" });

    // Today's periods
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = await Timetable.find({ 
      teacher: teacher._id,
      day: today
    });

    // Recent announcements
    const recentAnnouncements = await Announcement.find({
      $or: [
        { targetRoles: "teacher" },
        { targetRoles: "all" }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      totalClasses: classes.length,
      totalStudents,
      pendingGrades: pendingGrades || 0,
      todayPeriods: todaySchedule.length,
      recentAnnouncements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher's assigned classes
// @route   GET /api/teacher/my-classes
// @access  Private (Teacher)
export const getTeacherClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const classes = await Class.find({ classTeacher: teacher._id })
      .populate("subjects", "subjectName subjectCode")
      .populate("students", "firstName lastName studentId");

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher's schedule for today
// @route   GET /api/teacher/today-schedule
// @access  Private (Teacher)
export const getTeacherTodaySchedule = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = await Timetable.find({ 
      teacher: teacher._id,
      day: today
    })
    .populate("class", "className grade section")
    .populate("subject", "subjectName subjectCode")
    .sort({ startTime: 1 });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students in a specific class for a teacher
// @route   GET /api/teacher/class/:classId/students
// @access  Private (Teacher)
export const getTeacherClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId)
      .populate("students", "firstName lastName studentId profileImage email");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(classData.students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending assignments to grade
// @route   GET /api/teacher/pending-grading
// @access  Private (Teacher)
export const getTeacherPendingGrading = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    const assignments = await Assignment.find({ 
      teacher: teacher._id,
      status: "active" 
    })
    .populate("class", "className grade section")
    .populate("subject", "subjectName subjectCode");

    // This is a simplified version. In a real app, you'd check submissions.
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
