import Grade from "../models/Grade.js";
import mongoose from "mongoose";

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private
export const getGrades = async (req, res) => {
  try {
    const { studentId, classId, subjectId, academicYear, term } = req.query;
    
    let query = {};
    
    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const grades = await Grade.find(query)
      .populate("student", "firstName lastName studentId")
      .populate("subject", "subjectName subjectCode")
      .populate("class", "className grade section")
      .populate("teacher", "firstName lastName")
      .sort({ examDate: -1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private
export const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate("student", "firstName lastName studentId")
      .populate("subject", "subjectName subjectCode")
      .populate("class", "className grade section")
      .populate("teacher", "firstName lastName");

    if (grade) {
      res.json(grade);
    } else {
      res.status(404).json({ message: "Grade not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create grade
// @route   POST /api/grades
// @access  Private (Teacher, Admin)
export const createGrade = async (req, res) => {
  try {
    const {
      student,
      subject,
      classId,
      examType,
      examName,
      examDate,
      marksObtained,
      totalMarks,
      remarks,
      academicYear,
      term,
    } = req.body;

    const grade = await Grade.create({
      student,
      subject,
      class: classId,
      examType,
      examName,
      examDate,
      marksObtained,
      totalMarks,
      remarks,
      teacher: req.user._id,
      academicYear,
      term,
    });

    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Teacher, Admin)
export const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (grade) {
      Object.assign(grade, req.body);
      const updatedGrade = await grade.save();
      res.json(updatedGrade);
    } else {
      res.status(404).json({ message: "Grade not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin)
export const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (grade) {
      await grade.deleteOne();
      res.json({ message: "Grade removed" });
    } else {
      res.status(404).json({ message: "Grade not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student report card
// @route   GET /api/grades/report/:studentId
// @access  Private
export const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, term } = req.query;

    let query = { student: studentId };
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const grades = await Grade.find(query)
      .populate("subject", "subjectName subjectCode credits")
      .populate("class", "className grade section")
      .sort({ subject: 1, examDate: -1 });

    // Calculate overall statistics
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marksObtained, 0);
    const totalPossible = grades.reduce((sum, grade) => sum + grade.totalMarks, 0);
    const overallPercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

    // Group by subject
    const subjectWiseGrades = grades.reduce((acc, grade) => {
      const subjectId = grade.subject._id.toString();
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: grade.subject,
          grades: [],
        };
      }
      acc[subjectId].grades.push(grade);
      return acc;
    }, {});

    res.json({
      grades,
      subjectWiseGrades: Object.values(subjectWiseGrades),
      statistics: {
        totalMarks,
        totalPossible,
        overallPercentage: overallPercentage.toFixed(2),
        totalExams: grades.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class grade statistics
// @route   GET /api/grades/class-stats/:classId
// @access  Private (Teacher, Admin)
export const getClassGradeStats = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectId, examType } = req.query;

    let query = { class: classId };
    if (subjectId) query.subject = subjectId;
    if (examType) query.examType = examType;

    const stats = await Grade.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
          avgPercentage: { $avg: "$percentage" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const overallStats = await Grade.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalStudents: { $addToSet: "$student" },
          avgPercentage: { $avg: "$percentage" },
          maxPercentage: { $max: "$percentage" },
          minPercentage: { $min: "$percentage" },
        },
      },
    ]);

    res.json({
      gradeDistribution: stats,
      overall: {
        totalStudents: overallStats[0]?.totalStudents.length || 0,
        avgPercentage: overallStats[0]?.avgPercentage.toFixed(2) || 0,
        maxPercentage: overallStats[0]?.maxPercentage.toFixed(2) || 0,
        minPercentage: overallStats[0]?.minPercentage.toFixed(2) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

