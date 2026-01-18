import Attendance from "../models/Attendance.js";
import mongoose from "mongoose";

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = async (req, res) => {
  try {
    const { studentId, classId, startDate, endDate } = req.query;

    let query = {};

    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate("student", "firstName lastName studentId")
      .populate("class", "className grade section")
      .populate("subject", "subjectName subjectCode")
      .populate("markedBy", "firstName lastName")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("student", "firstName lastName studentId")
      .populate("class", "className grade section")
      .populate("subject", "subjectName subjectCode")
      .populate("markedBy", "firstName lastName");

    if (attendance) {
      res.json(attendance);
    } else {
      res.status(404).json({ message: "Attendance record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
export const markAttendance = async (req, res) => {
  try {
    const { student, classId, subject, date, status, remarks } = req.body;

    const attendance = await Attendance.create({
      student,
      class: classId,
      subject,
      date: date || Date.now(),
      status,
      remarks,
      markedBy: req.user._id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Attendance already marked for this student on this date" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private (Teacher, Admin)
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { classId, subject, date, attendanceRecords } = req.body;

    const attendanceData = attendanceRecords.map((record) => ({
      student: record.studentId,
      class: classId,
      subject,
      date: date || Date.now(),
      status: record.status,
      remarks: record.remarks,
      markedBy: req.user._id,
    }));

    const attendance = await Attendance.insertMany(attendanceData, { ordered: false });
    res.status(201).json(attendance);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Some attendance records already exist",
        insertedCount: error.insertedDocs?.length || 0
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Teacher, Admin)
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (attendance) {
      attendance.status = req.body.status || attendance.status;
      attendance.remarks = req.body.remarks || attendance.remarks;

      const updatedAttendance = await attendance.save();
      res.json(updatedAttendance);
    } else {
      res.status(404).json({ message: "Attendance record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (attendance) {
      await attendance.deleteOne();
      res.json({ message: "Attendance record removed" });
    } else {
      res.status(404).json({ message: "Attendance record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics for a student
// @route   GET /api/attendance/stats/:studentId
// @access  Private
export const getAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const stats = await Attendance.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDays = stats.reduce((acc, stat) => acc + stat.count, 0);
    const presentDays = stats.find((s) => s._id === "present")?.count || 0;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    res.json({
      stats,
      totalDays,
      presentDays,
      attendancePercentage: attendancePercentage.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

