import TeacherAttendance from "../models/TeacherAttendance.js";
import Teacher from "../models/Teacher.js";
import mongoose from "mongoose";

// @desc    Get all teacher attendance records
// @route   GET /api/teacher-attendance
// @access  Private (Admin)
export const getTeacherAttendance = async (req, res) => {
  try {
    const { teacherId, startDate, endDate, date } = req.query;

    let query = {};

    if (teacherId) query.teacher = teacherId;
    if (date) {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
        query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await TeacherAttendance.find(query)
      .populate({
          path: "teacher",
          select: "firstName lastName teacherId specialization",
          populate: { path: "user", select: "name email" }
      })
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark teacher attendance (single or bulk)
// @route   POST /api/teacher-attendance
// @access  Private (Admin)
export const markTeacherAttendance = async (req, res) => {
  try {
    const { attendanceRecords, date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();

    const results = [];

    for (const record of attendanceRecords) {
        const { teacherId, status, checkIn, checkOut, remarks } = record;

        // Try to update existing or create new
        const updatedRecord = await TeacherAttendance.findOneAndUpdate(
            { teacher: teacherId, date: { 
                $gte: new Date(attendanceDate).setHours(0,0,0,0), 
                $lte: new Date(attendanceDate).setHours(23,59,59,999) 
            }},
            {
                teacher: teacherId,
                date: attendanceDate,
                status,
                checkIn,
                checkOut,
                remarks,
                markedBy: req.user._id
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.push(updatedRecord);
    }

    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics for a teacher
// @route   GET /api/teacher-attendance/stats/:teacherId
// @access  Private (Admin, Teacher)
export const getTeacherAttendanceStats = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const stats = await TeacherAttendance.aggregate([
      {
        $match: {
          teacher: new mongoose.Types.ObjectId(teacherId),
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
