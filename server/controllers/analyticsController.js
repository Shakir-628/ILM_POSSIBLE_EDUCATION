import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Grade from "../models/Grade.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// @desc    Get attendance trends (last N days)
// @route   GET /api/analytics/attendance-trends
// @access  Private (Admin/Teacher)
export const getAttendanceTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          total: 1,
          present: 1,
          absent: 1,
          _id: 0,
        },
      },
    ]);

    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grade distribution
// @route   GET /api/analytics/grade-distribution
// @access  Private (Admin/Teacher)
export const getGradeDistribution = async (req, res) => {
  try {
    const { classId } = req.query;
    const match = classId ? { class: classId } : {};

    const distribution = await Grade.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          grade: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Ensure all grades are represented
    const gradeOrder = ["A+", "A", "B", "C", "D", "F"];
    const result = gradeOrder.map((grade) => {
      const found = distribution.find((d) => d.grade === grade);
      return { grade, count: found ? found.count : 0 };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class performance comparison
// @route   GET /api/analytics/class-performance
// @access  Private (Admin/Teacher)
export const getClassPerformance = async (req, res) => {
  try {
    const classes = await Class.find().select("className");

    const performanceData = await Promise.all(
      classes.map(async (cls) => {
        const grades = await Grade.find({ class: cls._id });

        if (grades.length === 0) {
          return {
            className: cls.className,
            averagePercentage: 0,
            totalStudents: 0,
          };
        }

        const totalMarks = grades.reduce((sum, g) => sum + (g.marks || 0), 0);
        const maxMarks = grades.reduce((sum, g) => sum + (g.totalMarks || 100), 0);
        const averagePercentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;

        return {
          className: cls.className,
          averagePercentage: parseFloat(averagePercentage),
          totalStudents: new Set(grades.map((g) => g.student?.toString())).size,
        };
      })
    );

    res.json(performanceData.sort((a, b) => b.averagePercentage - a.averagePercentage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrollment trends (monthly)
// @route   GET /api/analytics/enrollment-trends
// @access  Private (Admin)
export const getEnrollmentTrends = async (req, res) => {
  try {
    const enrollmentData = await Student.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$enrollmentDate" },
            month: { $month: "$enrollmentDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $cond: [{ $lt: ["$_id.month", 10] }, { $concat: ["0", { $toString: "$_id.month" }] }, { $toString: "$_id.month" }] },
            ],
          },
          count: 1,
          _id: 0,
        },
      },
      { $limit: 12 }, // Last 12 months
    ]);

    res.json(enrollmentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher workload (assignments and classes)
// @route   GET /api/analytics/teacher-workload
// @access  Private (Admin)
export const getTeacherWorkload = async (req, res) => {
  try {
    const teachers = await Teacher.find().select("firstName lastName");

    const workloadData = await Promise.all(
      teachers.map(async (teacher) => {
        const assignments = await Assignment.countDocuments({ teacher: teacher._id });
        const classes = await Class.countDocuments({ teacher: teacher._id });
        const pendingSubmissions = await Submission.countDocuments({
          assignment: { $in: await Assignment.find({ teacher: teacher._id }).select("_id") },
          status: "submitted",
        });

        return {
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          assignments,
          classes,
          pendingSubmissions,
        };
      })
    );

    res.json(workloadData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subject-wise performance
// @route   GET /api/analytics/subject-performance
// @access  Private (Admin/Teacher)
export const getSubjectPerformance = async (req, res) => {
  try {
    const performanceData = await Grade.aggregate([
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      { $unwind: "$subjectInfo" },
      {
        $group: {
          _id: "$subjectInfo.subjectName",
          totalMarks: { $sum: "$marks" },
          maxMarks: { $sum: "$totalMarks" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          subject: "$_id",
          averageScore: {
            $multiply: [
              { $divide: ["$totalMarks", "$maxMarks"] },
              100,
            ],
          },
          totalStudents: "$count",
          _id: 0,
        },
      },
      { $sort: { averageScore: -1 } },
    ]);

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance by class
// @route   GET /api/analytics/attendance-by-class
// @access  Private (Admin/Teacher)
export const getAttendanceByClass = async (req, res) => {
  try {
    const attendanceData = await Attendance.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classInfo.className",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          className: "$_id",
          attendanceRate: {
            $multiply: [{ $divide: ["$present", "$total"] }, 100],
          },
          _id: 0,
        },
      },
      { $sort: { attendanceRate: -1 } },
    ]);

    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comprehensive dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin/Teacher)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeStudents,
      totalAssignments,
      pendingSubmissions,
      todayAttendance,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments(),
      Student.countDocuments({ status: "active" }),
      Assignment.countDocuments(),
      Submission.countDocuments({ status: "submitted" }),
      Attendance.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    const presentToday = await Attendance.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
      status: "present",
    });

    const attendanceRate = todayAttendance > 0
      ? ((presentToday / todayAttendance) * 100).toFixed(2)
      : 0;

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      activeStudents,
      totalAssignments,
      pendingSubmissions,
      todayAttendance: {
        total: todayAttendance,
        present: presentToday,
        rate: attendanceRate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get smart alerts for students with significant attendance drop
// @route   GET /api/analytics/smart-alerts
// @access  Private (Admin/Teacher)
export const getSmartAlerts = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get attendance for all students in current and previous months
    const alerts = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: prevMonthStart },
        },
      },
      {
        $group: {
          _id: {
            student: "$student",
            isCurrentMonth: { $gte: ["$date", currentMonthStart] },
          },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: "$_id.student",
          currentMonth: {
            $push: {
              $cond: [
                "$_id.isCurrentMonth",
                { total: "$totalDays", present: "$presentDays" },
                "$$REMOVE",
              ],
            },
          },
          prevMonth: {
            $push: {
              $cond: [
                { $not: ["$_id.isCurrentMonth"] },
                { total: "$totalDays", present: "$presentDays" },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $project: {
          student: "$_id",
          curr: { $arrayElemAt: ["$currentMonth", 0] },
          prev: { $arrayElemAt: ["$prevMonth", 0] },
        },
      },
      // Ensure we have data for both months to compare
      {
        $match: {
          curr: { $exists: true },
          prev: { $exists: true },
        },
      },
      {
        $project: {
          student: 1,
          currRate: { $multiply: [{ $divide: ["$curr.present", "$curr.total"] }, 100] },
          prevRate: { $multiply: [{ $divide: ["$prev.present", "$prev.total"] }, 100] },
        },
      },
      {
        $project: {
          student: 1,
          currRate: 1,
          prevRate: 1,
          drop: { $subtract: ["$prevRate", "$currRate"] },
        },
      },
      {
        $match: {
          drop: { $gt: 20 }, // Drop of more than 20 percentage points
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          studentId: "$student",
          name: { $concat: ["$studentInfo.firstName", " ", "$studentInfo.lastName"] },
          studentRegistrationId: "$studentInfo.studentId",
          currRate: { $round: ["$currRate", 2] },
          prevRate: { $round: ["$prevRate", 2] },
          drop: { $round: ["$drop", 2] },
        },
      },
    ]);

    // Optional: Create notifications if they don't exist
    // For simplicity, we'll just return them as "active alerts" for the dashboard

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAttendanceTrends,
  getGradeDistribution,
  getClassPerformance,
  getEnrollmentTrends,
  getTeacherWorkload,
  getSubjectPerformance,
  getAttendanceByClass,
  getDashboardAnalytics,
  getSmartAlerts,
};

