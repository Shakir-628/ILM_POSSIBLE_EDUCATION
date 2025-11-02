import Subject from "../models/Subject.js";

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacher", "firstName lastName email")
      .populate("class", "className grade section");
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("teacher", "firstName lastName email")
      .populate("class", "className grade section");

    if (subject) {
      res.json(subject);
    } else {
      res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
  try {
    const {
      subjectName,
      subjectCode,
      description,
      teacher,
      classId,
      credits,
      totalHours,
      type,
    } = req.body;

    // Check if subject code already exists
    const subjectExists = await Subject.findOne({ subjectCode });
    if (subjectExists) {
      return res.status(400).json({ message: "Subject code already exists" });
    }

    const subject = await Subject.create({
      subjectName,
      subjectCode,
      description,
      teacher,
      class: classId,
      credits,
      totalHours,
      type,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      Object.assign(subject, req.body);
      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      await subject.deleteOne();
      res.json({ message: "Subject removed" });
    } else {
      res.status(404).json({ message: "Subject not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subjects by class
// @route   GET /api/subjects/class/:classId
// @access  Private
export const getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ class: req.params.classId })
      .populate("teacher", "firstName lastName email");
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subjects by teacher
// @route   GET /api/subjects/teacher/:teacherId
// @access  Private
export const getSubjectsByTeacher = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacher: req.params.teacherId })
      .populate("class", "className grade section");
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

