import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "../uploads/reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate Excel report for students
export const generateStudentsExcel = async (students) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  // Define columns
  worksheet.columns = [
    { header: "Student ID", key: "studentId", width: 15 },
    { header: "First Name", key: "firstName", width: 20 },
    { header: "Last Name", key: "lastName", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Date of Birth", key: "dateOfBirth", width: 15 },
    { header: "Class", key: "class", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Enrollment Date", key: "enrollmentDate", width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

  // Add data
  students.forEach((student) => {
    worksheet.addRow({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "",
      class: student.class?.className || "N/A",
      status: student.status,
      enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "",
    });
  });

  // Generate filename
  const filename = `students-${Date.now()}.xlsx`;
  const filepath = path.join(reportsDir, filename);

  // Write to file
  await workbook.xlsx.writeFile(filepath);

  return { filename, filepath };
};

// Generate Excel report for attendance
export const generateAttendanceExcel = async (attendanceData, className, date) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  // Title
  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = `Attendance Report - ${className}`;
  worksheet.getCell("A1").font = { bold: true, size: 14 };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.mergeCells("A2:E2");
  worksheet.getCell("A2").value = `Date: ${new Date(date).toLocaleDateString()}`;
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  // Add empty row
  worksheet.addRow([]);

  // Define columns
  worksheet.getRow(4).values = ["Student ID", "Student Name", "Status", "Marked By", "Time"];
  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(4).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  worksheet.getRow(4).font = { color: { argb: "FFFFFFFF" }, bold: true };

  // Add data
  attendanceData.forEach((record) => {
    worksheet.addRow([
      record.student?.studentId || "N/A",
      `${record.student?.firstName} ${record.student?.lastName}`,
      record.status,
      record.markedBy?.name || "System",
      new Date(record.createdAt).toLocaleTimeString(),
    ]);
  });

  // Set column widths
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 25;
  worksheet.getColumn(3).width = 12;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 15;

  const filename = `attendance-${className.replace(/\s+/g, "-")}-${Date.now()}.xlsx`;
  const filepath = path.join(reportsDir, filename);

  await workbook.xlsx.writeFile(filepath);

  return { filename, filepath };
};

// Generate PDF report for student
export const generateStudentPDF = async (student, attendance, grades) => {
  return new Promise((resolve, reject) => {
    const filename = `student-report-${student.studentId}-${Date.now()}.pdf`;
    const filepath = path.join(reportsDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("Student Report Card", { align: "center" });
    doc.moveDown();

    // Student Info
    doc.fontSize(12).text(`Student ID: ${student.studentId}`);
    doc.text(`Name: ${student.firstName} ${student.lastName}`);
    doc.text(`Email: ${student.email}`);
    doc.text(`Class: ${student.class?.className || "N/A"}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Attendance Section
    doc.fontSize(14).text("Attendance Summary", { underline: true });
    doc.moveDown(0.5);
    
    if (attendance && attendance.length > 0) {
      const totalDays = attendance.length;
      const presentDays = attendance.filter((a) => a.status === "present").length;
      const percentage = ((presentDays / totalDays) * 100).toFixed(2);

      doc.fontSize(11);
      doc.text(`Total Days: ${totalDays}`);
      doc.text(`Present: ${presentDays}`);
      doc.text(`Absent: ${totalDays - presentDays}`);
      doc.text(`Attendance Percentage: ${percentage}%`);
    } else {
      doc.fontSize(11).text("No attendance records available.");
    }
    doc.moveDown();

    // Grades Section
    doc.fontSize(14).text("Academic Performance", { underline: true });
    doc.moveDown(0.5);

    if (grades && grades.length > 0) {
      doc.fontSize(11);
      
      grades.forEach((grade) => {
        doc.text(`${grade.subject?.name || "N/A"}: ${grade.marks}/${grade.totalMarks || 100} - Grade: ${grade.grade}`);
      });

      const totalMarks = grades.reduce((sum, g) => sum + (g.marks || 0), 0);
      const maxMarks = grades.reduce((sum, g) => sum + (g.totalMarks || 100), 0);
      const overallPercentage = ((totalMarks / maxMarks) * 100).toFixed(2);

      doc.moveDown();
      doc.fontSize(12).text(`Overall Percentage: ${overallPercentage}%`, { bold: true });
    } else {
      doc.fontSize(11).text("No grade records available.");
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text("Generated by Student Management System", { align: "center" });
    doc.text(new Date().toLocaleDateString(), { align: "center" });

    doc.end();

    stream.on("finish", () => {
      resolve({ filename, filepath });
    });

    stream.on("error", reject);
  });
};

// Generate class performance report (Excel)
export const generateClassPerformanceExcel = async (classData, students, grades) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Class Performance");

  // Title
  worksheet.mergeCells("A1:F1");
  worksheet.getCell("A1").value = `Class Performance Report - ${classData.className}`;
  worksheet.getCell("A1").font = { bold: true, size: 14 };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.addRow([]);

  // Headers
  worksheet.getRow(3).values = [
    "Student ID",
    "Student Name",
    "Total Marks",
    "Percentage",
    "Grade",
    "Rank",
  ];
  worksheet.getRow(3).font = { bold: true };
  worksheet.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  worksheet.getRow(3).font = { color: { argb: "FFFFFFFF" }, bold: true };

  // Add student performance data
  const performanceData = students.map((student) => {
    const studentGrades = grades.filter((g) => g.student?.toString() === student._id?.toString());
    const totalMarks = studentGrades.reduce((sum, g) => sum + (g.marks || 0), 0);
    const maxMarks = studentGrades.reduce((sum, g) => sum + (g.totalMarks || 100), 0);
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;

    return {
      studentId: student.studentId,
      name: `${student.firstName} ${student.lastName}`,
      totalMarks,
      percentage,
      grade: getGrade(percentage),
    };
  });

  // Sort by percentage (descending)
  performanceData.sort((a, b) => b.percentage - a.percentage);

  // Add ranks and data
  performanceData.forEach((data, index) => {
    worksheet.addRow([
      data.studentId,
      data.name,
      data.totalMarks,
      `${data.percentage}%`,
      data.grade,
      index + 1,
    ]);
  });

  // Set column widths
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 25;
  worksheet.getColumn(3).width = 15;
  worksheet.getColumn(4).width = 12;
  worksheet.getColumn(5).width = 10;
  worksheet.getColumn(6).width = 10;

  const filename = `class-performance-${classData.className.replace(/\s+/g, "-")}-${Date.now()}.xlsx`;
  const filepath = path.join(reportsDir, filename);

  await workbook.xlsx.writeFile(filepath);

  return { filename, filepath };
};

// Helper function to calculate grade
const getGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

export default {
  generateStudentsExcel,
  generateAttendanceExcel,
  generateStudentPDF,
  generateClassPerformanceExcel,
};
