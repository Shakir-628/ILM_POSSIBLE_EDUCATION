import ReportCard from "../models/ReportCard.js";
import Student from "../models/Student.js";
import Grade from "../models/Grade.js";
import Attendance from "../models/Attendance.js";
import aiService from "../services/aiService.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// @desc    Get all report cards
// @route   GET /api/report-cards
// @access  Private
export const getAllReportCards = async (req, res) => {
  try {
    const { studentId, classId, academicYear, term } = req.query;
    const filter = {};

    if (studentId) filter.student = studentId;
    if (classId) filter.class = classId;
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const reportCards = await ReportCard.find(filter)
      .populate("student", "studentId firstName lastName")
      .populate("class", "className grade section")
      .populate("subjectGrades.subject", "subjectName subjectCode")
      .sort({ academicYear: -1, term: -1 });

    res.status(200).json({
      success: true,
      count: reportCards.length,
      data: reportCards,
    });
  } catch (error) {
    console.error("Get report cards error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get report card by ID
// @route   GET /api/report-cards/:id
// @access  Private
export const getReportCardById = async (req, res) => {
  try {
    const reportCard = await ReportCard.findById(req.params.id)
      .populate("student", "studentId firstName lastName dateOfBirth")
      .populate("class", "className grade section")
      .populate("subjectGrades.subject", "subjectName subjectCode")
      .populate("promotedToClass", "className grade");

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: "Report card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reportCard,
    });
  } catch (error) {
    console.error("Get report card error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate report card from grades
// @route   POST /api/report-cards/generate
// @access  Private (Admin)
export const generateReportCard = async (req, res) => {
  try {
    const { studentId, classId, academicYear, term } = req.body;

    // Get student
    const student = await Student.findById(studentId).populate("class");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get grades for the term
    const grades = await Grade.find({
      student: studentId,
      academicYear,
      term,
    }).populate("subject", "subjectName subjectCode");

    if (grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No grades found for this term",
      });
    }

    // Calculate totals
    let totalMarks = 0;
    let obtainedMarks = 0;

    const subjectGrades = grades.map((grade) => {
      totalMarks += grade.totalMarks;
      obtainedMarks += grade.obtainedMarks;

      const percentage = (grade.obtainedMarks / grade.totalMarks) * 100;

      return {
        subject: grade.subject._id,
        totalMarks: grade.totalMarks,
        obtainedMarks: grade.obtainedMarks,
        grade: grade.grade,
        percentage: percentage.toFixed(2),
        remarks: grade.remarks,
      };
    });

    // Get attendance
    const attendanceRecords = await Attendance.find({
      student: studentId,
      class: classId,
    });

    const totalWorkingDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === "present").length;

    // Determine top performing subject for AI Congratulatory Note
    const sortedGrades = [...subjectGrades].sort((a, b) => b.obtainedMarks - a.obtainedMarks);
    const topSubjectId = sortedGrades[0]?.subject;
    const topSubjectObj = grades.find(g => g.subject._id.toString() === topSubjectId.toString())?.subject;
    const topSubjectName = topSubjectObj?.subjectName || "Academic Excellence";

    // Generate AI Note
    const aiCongratulatoryNote = await aiService.generateCongratulatoryNote(student, topSubjectName);

    // Check if report card already exists
    const existing = await ReportCard.findOne({
      student: studentId,
      academicYear,
      term,
    });

    let reportCard;

    if (existing) {
      // Update existing
      existing.subjectGrades = subjectGrades;
      existing.totalMarks = totalMarks;
      existing.obtainedMarks = obtainedMarks;
      existing.totalWorkingDays = totalWorkingDays;
      existing.presentDays = presentDays;
      // Add AI note to remarks if specifically provided or update current ones
      existing.remarks = {
        ...existing.remarks,
        aiPersonalizedNote: aiCongratulatoryNote
      };
      await existing.save();
      reportCard = existing;
    } else {
      // Create new
      reportCard = await ReportCard.create({
        student: studentId,
        class: classId,
        academicYear,
        term,
        subjectGrades,
        totalMarks,
        obtainedMarks,
        totalWorkingDays,
        presentDays,
        generatedBy: req.user._id,
        remarks: {
          aiPersonalizedNote: aiCongratulatoryNote
        }
      });
    }

    await reportCard.populate("student", "studentId firstName lastName");
    await reportCard.populate("class", "className grade section");
    await reportCard.populate("subjectGrades.subject", "subjectName subjectCode");

    res.status(201).json({
      success: true,
      message: "Report card generated successfully",
      data: reportCard,
    });
  } catch (error) {
    console.error("Generate report card error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update report card
// @route   PUT /api/report-cards/:id
// @access  Private (Admin)
export const updateReportCard = async (req, res) => {
  try {
    const reportCard = await ReportCard.findById(req.params.id);

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: "Report card not found",
      });
    }

    const updated = await ReportCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("student", "studentId firstName lastName")
      .populate("class", "className grade section")
      .populate("subjectGrades.subject", "subjectName subjectCode");

    res.status(200).json({
      success: true,
      message: "Report card updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update report card error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Download report card PDF
// @route   GET /api/report-cards/:id/download
// @access  Private
export const downloadReportCard = async (req, res) => {
  try {
    const reportCard = await ReportCard.findById(req.params.id)
      .populate("student", "studentId firstName lastName dateOfBirth fatherName")
      .populate("class", "className grade section")
      .populate("subjectGrades.subject", "subjectName subjectCode");

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: "Report card not found",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_card_${reportCard.student.studentId}_${reportCard.term}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("ILM POSSIBLE EDUCATION", { align: "center" });
    doc.fontSize(18).text("Report Card", { align: "center" });
    doc.moveDown();

    // Student Info
    doc.fontSize(12).font("Helvetica");
    doc.text(`Student Name: ${reportCard.student.firstName} ${reportCard.student.lastName}`);
    doc.text(`Student ID: ${reportCard.student.studentId}`);
    doc.text(`Class: ${reportCard.class.className} - ${reportCard.class.grade}`);
    doc.text(`Academic Year: ${reportCard.academicYear}`);
    doc.text(`Term: ${reportCard.term}`);
    doc.moveDown(2);

    // Marks Table
    doc.fontSize(14).font("Helvetica-Bold").text("Subject-wise Performance");
    doc.moveDown();

    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 200;
    const col3X = 300;
    const col4X = 400;
    const col5X = 480;

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Subject", col1X, tableTop);
    doc.text("Total Marks", col2X, tableTop);
    doc.text("Obtained", col3X, tableTop);
    doc.text("Percentage", col4X, tableTop);
    doc.text("Grade", col5X, tableTop);

    doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Rows
    let y = tableTop + 25;
    doc.font("Helvetica").fontSize(9);

    reportCard.subjectGrades.forEach((subjectGrade) => {
      doc.text(subjectGrade.subject.subjectName, col1X, y, { width: 140 });
      doc.text(subjectGrade.totalMarks.toString(), col2X, y);
      doc.text(subjectGrade.obtainedMarks.toString(), col3X, y);
      doc.text(subjectGrade.percentage.toFixed(2) + "%", col4X, y);
      doc.text(subjectGrade.grade, col5X, y);
      y += 20;
    });

    // Total Row
    doc.moveTo(col1X, y).lineTo(550, y).stroke();
    y += 10;
    doc.font("Helvetica-Bold");
    doc.text("TOTAL", col1X, y);
    doc.text(reportCard.totalMarks.toString(), col2X, y);
    doc.text(reportCard.obtainedMarks.toString(), col3X, y);
    doc.text(reportCard.percentage.toFixed(2) + "%", col4X, y);
    doc.text(reportCard.overallGrade, col5X, y);

    // Summary
    doc.moveDown(3);
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Summary");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Overall Percentage: ${reportCard.percentage.toFixed(2)}%`);
    doc.text(`Overall Grade: ${reportCard.overallGrade}`);
    doc.text(`GPA: ${reportCard.gpa}/4.0`);
    if (reportCard.classPosition) {
      doc.text(`Class Position: ${reportCard.classPosition}/${reportCard.totalStudents}`);
    }

    // Attendance
    doc.moveDown(2);
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Attendance");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total Working Days: ${reportCard.totalWorkingDays || 0}`);
    doc.text(`Present Days: ${reportCard.presentDays || 0}`);
    doc.text(`Attendance Percentage: ${reportCard.attendancePercentage?.toFixed(2) || 0}%`);

    // Remarks
    if (reportCard.remarks) {
      doc.moveDown(2);
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Remarks");
      doc.fontSize(10).font("Helvetica");
      if (reportCard.remarks.classTeacher) {
        doc.text(`Class Teacher: ${reportCard.remarks.classTeacher}`);
      }
      if (reportCard.remarks.principal) {
        doc.text(`Principal: ${reportCard.remarks.principal}`);
      }
      if (reportCard.remarks.aiPersonalizedNote) {
        doc.moveDown();
        doc.fontSize(10).font("Helvetica-Oblique").text(`AI Generated Note: ${reportCard.remarks.aiPersonalizedNote}`, { oblique: true, color: 'gray' });
      }
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Download report card error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

