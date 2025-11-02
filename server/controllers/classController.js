import Class from "../models/Class.js";

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("classTeacher", "firstName lastName email")
      .populate("subjects", "subjectName subjectCode")
      .populate("students", "firstName lastName studentId");
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate("classTeacher", "firstName lastName email")
      .populate("subjects", "subjectName subjectCode")
      .populate("students", "firstName lastName studentId email");

    if (classData) {
      res.json(classData);
    } else {
      res.status(404).json({ message: "Class not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin)
export const createClass = async (req, res) => {
  try {
    const {
      className,
      grade,
      section,
      classTeacher,
      subjects,
      students,
      capacity,
      room,
      schedule,
      academicYear,
    } = req.body;

    // Check if class already exists
    const classExists = await Class.findOne({ className });
    if (classExists) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const newClass = await Class.create({
      className,
      grade,
      section,
      classTeacher,
      subjects,
      students,
      capacity,
      room,
      schedule,
      academicYear,
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (classData) {
      Object.assign(classData, req.body);
      const updatedClass = await classData.save();
      res.json(updatedClass);
    } else {
      res.status(404).json({ message: "Class not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (classData) {
      await classData.deleteOne();
      res.json({ message: "Class removed" });
    } else {
      res.status(404).json({ message: "Class not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add student to class
// @route   PUT /api/classes/:id/add-student
// @access  Private (Admin)
export const addStudentToClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    const { studentId } = req.body;

    if (classData) {
      if (classData.students.includes(studentId)) {
        return res.status(400).json({ message: "Student already in class" });
      }

      if (classData.students.length >= classData.capacity) {
        return res.status(400).json({ message: "Class is at full capacity" });
      }

      classData.students.push(studentId);
      await classData.save();
      res.json(classData);
    } else {
      res.status(404).json({ message: "Class not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove student from class
// @route   PUT /api/classes/:id/remove-student
// @access  Private (Admin)
export const removeStudentFromClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    const { studentId } = req.body;

    if (classData) {
      classData.students = classData.students.filter(
        (id) => id.toString() !== studentId
      );
      await classData.save();
      res.json(classData);
    } else {
      res.status(404).json({ message: "Class not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

