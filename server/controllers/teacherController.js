import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import { generateUniqueTeacherId } from "../utils/generateId.js";

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("user", "name email")
      .populate("subjects", "subjectName subjectCode");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("user", "name email")
      .populate("subjects", "subjectName subjectCode");

    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res) => {
  try {
    const {
      userId,
      teacherId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      qualification,
      specialization,
      experience,
      subjects,
      joiningDate,
      salary,
      profileImage,
      password,
    } = req.body;

    // Auto-generate teacher ID if not provided
    let finalTeacherId = teacherId;
    if (!finalTeacherId) {
      finalTeacherId = await generateUniqueTeacherId();
    } else {
      // Check if manually provided teacher ID already exists
      const teacherExists = await Teacher.findOne({ teacherId: finalTeacherId });
      if (teacherExists) {
        return res.status(400).json({ message: "Teacher ID already exists" });
      }
    }

    // Check if email already exists
    const emailExists = await Teacher.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let userIdToUse = userId;

    // If no userId provided, create a user account automatically
    if (!userId) {
      // Check if user with this email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Create user account
      const defaultPassword = password || "teacher123"; // Use provided password or default
      const user = await User.create({
        name: `${firstName} ${lastName}`,
        email,
        password: defaultPassword,
        role: "teacher",
        phone,
      });

      userIdToUse = user._id;
    }

    const teacher = await Teacher.create({
      user: userIdToUse,
      teacherId: finalTeacherId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      qualification,
      specialization,
      experience,
      subjects,
      joiningDate,
      salary,
      profileImage,
    });

    // Populate user data before sending response
    await teacher.populate("user", "name email role");

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      Object.assign(teacher, req.body);
      const updatedTeacher = await teacher.save();
      res.json(updatedTeacher);
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      await teacher.deleteOne();
      res.json({ message: "Teacher removed" });
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

