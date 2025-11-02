import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";

// @desc    Get all timetables
// @route   GET /api/timetables
// @access  Private (Admin, Teacher)
export const getAllTimetables = async (req, res) => {
  try {
    const { classId, academicYear } = req.query;
    const filter = {};
    
    if (classId) filter.class = classId;
    if (academicYear) filter.academicYear = academicYear;

    const timetables = await Timetable.find(filter)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId",
      })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables,
    });
  } catch (error) {
    console.error("Get timetables error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get timetable by ID
// @route   GET /api/timetables/:id
// @access  Private
export const getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId email",
      })
      .populate("createdBy", "name");

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error("Get timetable error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get timetable by class
// @route   GET /api/timetables/class/:classId
// @access  Private
export const getTimetableByClass = async (req, res) => {
  try {
    const { academicYear, term } = req.query;
    const filter = { class: req.params.classId };
    
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const timetable = await Timetable.findOne(filter)
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId",
      });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found for this class",
      });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error("Get timetable by class error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create timetable
// @route   POST /api/timetables
// @access  Private (Admin)
export const createTimetable = async (req, res) => {
  try {
    const timetableData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Check if timetable already exists for this class/year/term
    const existing = await Timetable.findOne({
      class: req.body.class,
      academicYear: req.body.academicYear,
      term: req.body.term,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Timetable already exists for this class, year, and term",
      });
    }

    const timetable = await Timetable.create(timetableData);

    await timetable.populate("class", "className grade section");
    await timetable.populate({
      path: "schedule.periods.subject",
      select: "subjectName subjectCode",
    });
    await timetable.populate({
      path: "schedule.periods.teacher",
      select: "firstName lastName teacherId",
    });

    res.status(201).json({
      success: true,
      message: "Timetable created successfully",
      data: timetable,
    });
  } catch (error) {
    console.error("Create timetable error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update timetable
// @route   PUT /api/timetables/:id
// @access  Private (Admin)
export const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("class", "className grade section")
      .populate({
        path: "schedule.periods.subject",
        select: "subjectName subjectCode",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "firstName lastName teacherId",
      });

    res.status(200).json({
      success: true,
      message: "Timetable updated successfully",
      data: updatedTimetable,
    });
  } catch (error) {
    console.error("Update timetable error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete timetable
// @route   DELETE /api/timetables/:id
// @access  Private (Admin)
export const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    await timetable.deleteOne();

    res.status(200).json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    console.error("Delete timetable error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Detect timetable conflicts
// @route   POST /api/timetables/check-conflicts
// @access  Private (Admin)
export const checkConflicts = async (req, res) => {
  try {
    const { schedule, class: classId, academicYear, term } = req.body;
    const conflicts = [];

    // Check for teacher conflicts
    for (const daySchedule of schedule) {
      for (const period of daySchedule.periods) {
        if (!period.teacher || !period.subject) continue;

        // Find other timetables with same teacher at same time
        const otherTimetables = await Timetable.find({
          _id: { $ne: req.body.excludeId }, // Exclude current timetable if editing
          academicYear,
          term,
          "schedule.day": daySchedule.day,
          "schedule.periods": {
            $elemMatch: {
              teacher: period.teacher,
              startTime: period.startTime,
              endTime: period.endTime,
            },
          },
        }).populate("class", "className grade");

        if (otherTimetables.length > 0) {
          conflicts.push({
            day: daySchedule.day,
            period: period.periodNumber,
            time: `${period.startTime} - ${period.endTime}`,
            teacher: period.teacher,
            conflictWith: otherTimetables.map((t) => ({
              class: t.class.className,
              grade: t.class.grade,
            })),
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      hasConflicts: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    console.error("Check conflicts error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

