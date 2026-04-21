import OnlineClass from "../models/OnlineClass.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import crypto from "crypto";

// @desc    Create a new online class
// @route   POST /api/online-classes
// @access  Private (Teacher, Admin)
export const createOnlineClass = async (req, res) => {
  try {
    const { title, subject, classId, startTime, duration, description } = req.body;

    const teacher = await Teacher.findOne({ user: req.user._id });
    const teacherId = teacher ? teacher._id : req.body.teacherId;

    if (!teacherId) {
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only teachers can schedule classes. Please complete your teacher profile." });
      }
      return res.status(400).json({
        success: false,
        message: "Teacher identification is required. Please provide a teacherId."
      });
    }

    // Generate a unique meeting ID
    const meetingId = crypto.randomBytes(4).toString('hex') + '-' + Date.now().toString().slice(-4);

    // For now we'll use a Jitsi link as default, but this could be Zoom/Teams
    const meetingLink = `https://meet.jit.si/ILM-Possible-${meetingId}`;

    const onlineClass = await OnlineClass.create({
      title,
      subject,
      class: classId,
      teacher: teacherId,
      startTime,
      duration,
      meetingId,
      meetingLink,
      description
    });

    res.status(201).json({
      success: true,
      data: onlineClass
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all classes for a teacher or student
// @route   GET /api/online-classes
// @access  Private
export const getOnlineClasses = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      query.teacher = teacher._id;
    } else if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      query.class = student.class;
    }

    const classes = await OnlineClass.find(query)
      .populate('subject', 'subjectName subjectCode')
      .populate('class', 'className grade section')
      .populate('teacher', 'firstName lastName')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update class status (start/end)
// @route   PATCH /api/online-classes/:id/status
// @access  Private (Teacher)
export const updateClassStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const onlineClass = await OnlineClass.findById(req.params.id);

    if (!onlineClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    onlineClass.status = status;
    await onlineClass.save();

    res.json({
      success: true,
      data: onlineClass
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a scheduled class
// @route   DELETE /api/online-classes/:id
// @access  Private (Teacher, Admin)
export const deleteOnlineClass = async (req, res) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    await onlineClass.deleteOne();
    res.json({ success: true, message: "Class removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
