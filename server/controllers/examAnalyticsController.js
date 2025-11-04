import ExamSchedule from "../models/ExamSchedule.js";
import ReportCard from "../models/ReportCard.js";
import Grade from "../models/Grade.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";

// @desc    Get exam analytics dashboard
// @route   GET /api/exam-analytics/dashboard
// @access  Private (Admin, Teacher)
export const getExamDashboard = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const [
      totalExams,
      totalReportCards,
      averagePercentage,
      passRate,
      gradeDistribution,
    ] = await Promise.all([
      ExamSchedule.countDocuments(filter),
      ReportCard.countDocuments(filter),
      ReportCard.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: "$percentage" } } },
      ]),
      ReportCard.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: {
              $sum: { $cond: [{ $gte: ["$percentage", 33] }, 1, 0] },
            },
          },
        },
      ]),
      ReportCard.aggregate([
        { $match: filter },
        { $group: { _id: "$overallGrade", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const passRateData = passRate[0] || { total: 0, passed: 0 };
    const calculatedPassRate = passRateData.total > 0
      ? ((passRateData.passed / passRateData.total) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalExams,
        totalReportCards,
        averagePercentage: averagePercentage[0]?.avg?.toFixed(2) || 0,
        passRate: calculatedPassRate,
        gradeDistribution: gradeDistribution.map((item) => ({
          grade: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error("Get exam dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get class-wise exam performance
// @route   GET /api/exam-analytics/class-performance
// @access  Private (Admin, Teacher)
export const getClassExamPerformance = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const classPerformance = await ReportCard.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$class",
          averagePercentage: { $avg: "$percentage" },
          averageGPA: { $avg: "$gpa" },
          totalStudents: { $sum: 1 },
          passed: {
            $sum: { $cond: [{ $gte: ["$percentage", 33] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      { $unwind: "$classInfo" },
      {
        $project: {
          className: "$classInfo.className",
          grade: "$classInfo.grade",
          averagePercentage: { $round: ["$averagePercentage", 2] },
          averageGPA: { $round: ["$averageGPA", 2] },
          totalStudents: 1,
          passed: 1,
          passRate: {
            $multiply: [
              { $divide: ["$passed", "$totalStudents"] },
              100,
            ],
          },
        },
      },
      { $sort: { averagePercentage: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: classPerformance,
    });
  } catch (error) {
    console.error("Get class exam performance error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get subject-wise exam performance
// @route   GET /api/exam-analytics/subject-performance
// @access  Private (Admin, Teacher)
export const getSubjectExamPerformance = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const subjectPerformance = await ReportCard.aggregate([
      { $match: filter },
      { $unwind: "$subjectGrades" },
      {
        $group: {
          _id: "$subjectGrades.subject",
          averageMarks: { $avg: "$subjectGrades.obtainedMarks" },
          averagePercentage: { $avg: "$subjectGrades.percentage" },
          totalStudents: { $sum: 1 },
          highestMarks: { $max: "$subjectGrades.obtainedMarks" },
          lowestMarks: { $min: "$subjectGrades.obtainedMarks" },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      { $unwind: "$subjectInfo" },
      {
        $project: {
          subjectName: "$subjectInfo.subjectName",
          subjectCode: "$subjectInfo.subjectCode",
          averageMarks: { $round: ["$averageMarks", 2] },
          averagePercentage: { $round: ["$averagePercentage", 2] },
          totalStudents: 1,
          highestMarks: 1,
          lowestMarks: 1,
        },
      },
      { $sort: { averagePercentage: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: subjectPerformance,
    });
  } catch (error) {
    console.error("Get subject exam performance error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get top performers
// @route   GET /api/exam-analytics/top-performers
// @access  Private (Admin, Teacher)
export const getTopPerformers = async (req, res) => {
  try {
    const { academicYear, term, limit = 10 } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const topPerformers = await ReportCard.find(filter)
      .populate("student", "studentId firstName lastName")
      .populate("class", "className grade")
      .sort({ percentage: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: topPerformers,
    });
  } catch (error) {
    console.error("Get top performers error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get exam trends (performance over time)
// @route   GET /api/exam-analytics/trends
// @access  Private (Admin, Teacher)
export const getExamTrends = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;

    const trends = await ReportCard.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$term",
          averagePercentage: { $avg: "$percentage" },
          averageGPA: { $avg: "$gpa" },
          totalStudents: { $sum: 1 },
        },
      },
      {
        $project: {
          term: "$_id",
          averagePercentage: { $round: ["$averagePercentage", 2] },
          averageGPA: { $round: ["$averageGPA", 2] },
          totalStudents: 1,
          _id: 0,
        },
      },
      { $sort: { term: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error("Get exam trends error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get grade analytics by class
// @route   GET /api/exam-analytics/grade-analytics/:classId
// @access  Private (Admin, Teacher)
export const getGradeAnalyticsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear, term } = req.query;
    const filter = { class: classId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const analytics = await ReportCard.find(filter)
      .populate("student", "studentId firstName lastName")
      .sort({ percentage: -1 });

    const stats = {
      totalStudents: analytics.length,
      highestPercentage: analytics[0]?.percentage || 0,
      lowestPercentage: analytics[analytics.length - 1]?.percentage || 0,
      averagePercentage: analytics.reduce((sum, r) => sum + r.percentage, 0) / analytics.length || 0,
      passCount: analytics.filter(r => r.percentage >= 33).length,
      failCount: analytics.filter(r => r.percentage < 33).length,
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        students: analytics,
      },
    });
  } catch (error) {
    console.error("Get grade analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

