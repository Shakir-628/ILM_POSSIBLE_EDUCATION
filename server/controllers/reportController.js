import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import FeePayment from '../models/FeePayment.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Grade from '../models/Grade.js';
import ReportCard from '../models/ReportCard.js';
import Class from '../models/Class.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// @desc    Generate Attendance Report
// @route   POST /api/reports/attendance
// @access  Private (Admin, Teacher)
export const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, classId, status, format = 'json' } = req.body;

    const filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (classId) {
      filter.class = classId;
    }
    if (status) {
      filter.status = status;
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('student', 'studentId firstName lastName')
      .populate('class', 'className grade')
      .populate('subject', 'subjectName')
      .sort({ date: -1 });

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0;

    const reportData = {
      title: 'Attendance Report',
      generatedAt: new Date(),
      filters: { startDate, endDate, classId, status },
      statistics: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate: `${attendanceRate}%`,
      },
      records: attendanceRecords,
    };

    if (format === 'excel') {
      return generateAttendanceExcel(reportData, res);
    } else if (format === 'pdf') {
      return generateAttendancePDF(reportData, res);
    }

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Generate attendance report error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate Financial Report
// @route   POST /api/reports/financial
// @access  Private (Admin)
export const generateFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, type, format = 'json' } = req.body;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Fetch financial data
    const [feePayments, expenses, incomes] = await Promise.all([
      FeePayment.find({ ...dateFilter, paymentStatus: 'completed' })
        .populate('student', 'studentId firstName lastName')
        .populate('feeStructure', 'feeName amount'),
      Expense.find(dateFilter),
      Income.find(dateFilter),
    ]);

    // Calculate totals
    const totalFeeIncome = feePayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalOtherIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalIncome = totalFeeIncome + totalOtherIncome;
    const netProfit = totalIncome - totalExpenses;

    // Category-wise breakdown
    const expenseByCategory = {};
    expenses.forEach(expense => {
      expenseByCategory[expense.category] = (expenseByCategory[expense.category] || 0) + expense.amount;
    });

    const incomeByCategory = {};
    incomes.forEach(income => {
      incomeByCategory[income.category] = (incomeByCategory[income.category] || 0) + income.amount;
    });

    const reportData = {
      title: 'Financial Report',
      generatedAt: new Date(),
      filters: { startDate, endDate, type },
      summary: {
        totalIncome,
        totalFeeIncome,
        totalOtherIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
      },
      breakdown: {
        feePayments: feePayments.length,
        expenses: expenses.length,
        otherIncomes: incomes.length,
        expenseByCategory,
        incomeByCategory,
      },
      details: {
        feePayments: type === 'detailed' ? feePayments : feePayments.slice(0, 10),
        expenses: type === 'detailed' ? expenses : expenses.slice(0, 10),
        incomes: type === 'detailed' ? incomes : incomes.slice(0, 10),
      },
    };

    if (format === 'excel') {
      return generateFinancialExcel(reportData, res);
    } else if (format === 'pdf') {
      return generateFinancialPDF(reportData, res);
    }

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Generate financial report error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate Custom Report
// @route   POST /api/reports/custom
// @access  Private (Admin, Teacher)
export const generateCustomReport = async (req, res) => {
  try {
    const { reportType, filters, fields, format = 'json' } = req.body;

    let reportData = {};

    switch (reportType) {
      case 'student-performance':
        reportData = await generateStudentPerformanceReport(filters, fields);
        break;
      case 'class-summary':
        reportData = await generateClassSummaryReport(filters, fields);
        break;
      case 'teacher-workload':
        reportData = await generateTeacherWorkloadReport(filters, fields);
        break;
      case 'fee-collection':
        reportData = await generateFeeCollectionReport(filters, fields);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    if (format === 'excel') {
      return generateCustomExcel(reportData, res);
    } else if (format === 'pdf') {
      return generateCustomPDF(reportData, res);
    }

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper functions for custom reports
async function generateStudentPerformanceReport(filters, fields) {
  const { classId, startDate, endDate } = filters;
  const filter = {};
  
  if (classId) filter.class = classId;

  const students = await Student.find(filter)
    .populate('class', 'className grade')
    .lean();

  // Build date filter for grades and attendance if provided
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const enrichedStudents = await Promise.all(
    students.map(async (student) => {
      const grades = await Grade.find({ student: student._id, ...dateFilter });
      const attendance = await Attendance.find({ student: student._id, 
        ...(startDate && endDate ? { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {})
      });
      
      const avgGrade = grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
        : 0;
      
      const attendanceRate = attendance.length > 0
        ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
        : 0;

      return {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        class: student.class,
        averageGrade: avgGrade.toFixed(2),
        attendanceRate: attendanceRate.toFixed(2),
        totalGrades: grades.length,
        totalAttendance: attendance.length,
      };
    })
  );

  // Calculate overall statistics
  const totalAvgGrade = enrichedStudents.length > 0
    ? enrichedStudents.reduce((sum, s) => sum + parseFloat(s.averageGrade), 0) / enrichedStudents.length
    : 0;
  
  const totalAvgAttendance = enrichedStudents.length > 0
    ? enrichedStudents.reduce((sum, s) => sum + parseFloat(s.attendanceRate), 0) / enrichedStudents.length
    : 0;

  return {
    title: 'Student Performance Report',
    generatedAt: new Date(),
    filters,
    totalStudents: enrichedStudents.length,
    summary: {
      totalStudents: enrichedStudents.length,
      averageGrade: totalAvgGrade.toFixed(2),
      averageAttendance: totalAvgAttendance.toFixed(2),
    },
    data: enrichedStudents,
  };
}

async function generateClassSummaryReport(filters, fields) {
  const { classId } = filters;
  const filter = classId ? { _id: classId } : {};

  const classes = await Class.find(filter).lean();

  const enrichedClasses = await Promise.all(
    classes.map(async (cls) => {
      const students = await Student.countDocuments({ class: cls._id });
      const grades = await Grade.find({ class: cls._id });
      const attendance = await Attendance.find({ class: cls._id });

      const avgGrade = grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
        : 0;

      const attendanceRate = attendance.length > 0
        ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
        : 0;

      return {
        ...cls,
        totalStudents: students,
        averageGrade: avgGrade.toFixed(2),
        attendanceRate: attendanceRate.toFixed(2),
      };
    })
  );

  return {
    title: 'Class Summary Report',
    generatedAt: new Date(),
    filters,
    totalClasses: enrichedClasses.length,
    data: enrichedClasses,
  };
}

async function generateTeacherWorkloadReport(filters, fields) {
  const teachers = await Teacher.find().populate('subjects', 'subjectName').lean();

  const enrichedTeachers = await Promise.all(
    teachers.map(async (teacher) => {
      const classes = await Class.countDocuments({ teacher: teacher._id });
      const attendance = await Attendance.countDocuments({ teacher: teacher._id });

      return {
        ...teacher,
        assignedClasses: classes,
        attendanceRecords: attendance,
        subjects: teacher.subjects?.map(s => s.subjectName).join(', ') || 'N/A',
      };
    })
  );

  return {
    title: 'Teacher Workload Report',
    generatedAt: new Date(),
    filters,
    totalTeachers: enrichedTeachers.length,
    data: enrichedTeachers,
  };
}

async function generateFeeCollectionReport(filters, fields) {
  const { startDate, endDate, paymentStatus } = filters;
  const filter = {};

  if (startDate && endDate) {
    filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  const payments = await FeePayment.find(filter)
    .populate('student', 'studentId firstName lastName')
    .populate('feeStructure', 'feeName amount')
    .lean();

  const totalCollected = payments
    .filter(p => p.paymentStatus === 'completed')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalPending = payments
    .filter(p => p.paymentStatus === 'pending')
    .reduce((sum, p) => sum + (p.totalAmount - p.amountPaid), 0);

  return {
    title: 'Fee Collection Report',
    generatedAt: new Date(),
    filters,
    summary: {
      totalPayments: payments.length,
      totalCollected,
      totalPending,
      collectionRate: payments.length > 0
        ? ((payments.filter(p => p.paymentStatus === 'completed').length / payments.length) * 100).toFixed(2)
        : 0,
    },
    data: payments,
  };
}

// Excel generation functions
function generateAttendanceExcel(reportData, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Class', key: 'class', width: 15 },
    { header: 'Subject', key: 'subject', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 30 },
  ];

  reportData.records.forEach(record => {
    worksheet.addRow({
      date: new Date(record.date).toLocaleDateString(),
      studentId: record.student?.studentId || 'N/A',
      studentName: `${record.student?.firstName} ${record.student?.lastName}`,
      class: record.class?.className || 'N/A',
      subject: record.subject?.subjectName || 'N/A',
      status: record.status,
      remarks: record.remarks || '',
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');

  return workbook.xlsx.write(res).then(() => res.end());
}

function generateFinancialExcel(reportData, res) {
  const workbook = new ExcelJS.Workbook();
  
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['Financial Report Summary']);
  summarySheet.addRow(['Total Income', reportData.summary.totalIncome]);
  summarySheet.addRow(['Total Expenses', reportData.summary.totalExpenses]);
  summarySheet.addRow(['Net Profit', reportData.summary.netProfit]);
  summarySheet.addRow(['Profit Margin', `${reportData.summary.profitMargin}%`]);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');

  return workbook.xlsx.write(res).then(() => res.end());
}

function generateCustomExcel(reportData, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportData.title);

  if (reportData.data && reportData.data.length > 0) {
    const headers = Object.keys(reportData.data[0]);
    worksheet.columns = headers.map(header => ({
      header: header.charAt(0).toUpperCase() + header.slice(1),
      key: header,
      width: 20,
    }));

    reportData.data.forEach(row => worksheet.addRow(row));
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${reportData.title.toLowerCase().replace(/ /g, '-')}.xlsx`);

  return workbook.xlsx.write(res).then(() => res.end());
}

// PDF generation functions
function generateAttendancePDF(reportData, res) {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');

  doc.pipe(res);

  doc.fontSize(20).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text('Statistics:');
  doc.fontSize(11);
  doc.text(`Total Records: ${reportData.statistics.totalRecords}`);
  doc.text(`Present: ${reportData.statistics.presentCount}`);
  doc.text(`Absent: ${reportData.statistics.absentCount}`);
  doc.text(`Attendance Rate: ${reportData.statistics.attendanceRate}`);

  doc.end();
}

function generateFinancialPDF(reportData, res) {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');

  doc.pipe(res);

  doc.fontSize(20).text('Financial Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Summary:');
  doc.fontSize(11);
  doc.text(`Total Income: $${reportData.summary.totalIncome}`);
  doc.text(`Total Expenses: $${reportData.summary.totalExpenses}`);
  doc.text(`Net Profit: $${reportData.summary.netProfit}`);
  doc.text(`Profit Margin: ${reportData.summary.profitMargin}%`);

  doc.end();
}

function generateCustomPDF(reportData, res) {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${reportData.title.toLowerCase().replace(/ /g, '-')}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text(reportData.title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();

  if (reportData.summary) {
    doc.fontSize(14).text('Summary:');
    doc.fontSize(11);
    Object.entries(reportData.summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`);
    });
  }

  doc.end();
}
