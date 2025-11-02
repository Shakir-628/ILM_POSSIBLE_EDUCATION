import ExamSchedule from "../models/ExamSchedule.js";

// @desc    Get all exam schedules
// @route   GET /api/exam-schedules
// @access  Private
export const getAllExamSchedules = async (req, res) => {
  try {
    const { classId, academicYear, status } = req.query;
    const filter = {};

    if (classId) filter.class = classId;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    const schedules = await ExamSchedule.find(filter)
      .populate("class", "className grade section")
      .populate("schedule.subject", "subjectName subjectCode")
      .populate("schedule.invigilator", "firstName lastName teacherId")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Get exam schedules error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get exam schedule by ID
// @route   GET /api/exam-schedules/:id
// @access  Private
export const getExamScheduleById = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findById(req.params.id)
      .populate("class", "className grade section")
      .populate("schedule.subject", "subjectName subjectCode")
      .populate("schedule.invigilator", "firstName lastName teacherId email")
      .populate("createdBy", "name email");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Get exam schedule error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create exam schedule
// @route   POST /api/exam-schedules
// @access  Private (Admin)
export const createExamSchedule = async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const schedule = await ExamSchedule.create(scheduleData);

    await schedule.populate("class", "className grade section");
    await schedule.populate("schedule.subject", "subjectName subjectCode");
    await schedule.populate("schedule.invigilator", "firstName lastName teacherId");

    res.status(201).json({
      success: true,
      message: "Exam schedule created successfully",
      data: schedule,
    });
  } catch (error) {
    console.error("Create exam schedule error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update exam schedule
// @route   PUT /api/exam-schedules/:id
// @access  Private (Admin)
export const updateExamSchedule = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    const updatedSchedule = await ExamSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("class", "className grade section")
      .populate("schedule.subject", "subjectName subjectCode")
      .populate("schedule.invigilator", "firstName lastName teacherId");

    res.status(200).json({
      success: true,
      message: "Exam schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("Update exam schedule error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete exam schedule
// @route   DELETE /api/exam-schedules/:id
// @access  Private (Admin)
export const deleteExamSchedule = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      message: "Exam schedule deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam schedule error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get exam schedules by class
// @route   GET /api/exam-schedules/class/:classId
// @access  Private
export const getExamSchedulesByClass = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = { class: req.params.classId };

    if (academicYear) filter.academicYear = academicYear;

    const schedules = await ExamSchedule.find(filter)
      .populate("class", "className grade section")
      .populate("schedule.subject", "subjectName subjectCode")
      .populate("schedule.invigilator", "firstName lastName teacherId")
      .sort({ "schedule.examDate": 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Get schedules by class error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

