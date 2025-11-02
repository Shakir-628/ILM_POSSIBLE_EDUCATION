import Parent from "../models/Parent.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import { generateId } from "../utils/generateId.js";
import bcrypt from "bcryptjs";

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private (Admin)
export const getParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate("user", "name email")
      .populate("children", "studentId firstName lastName class")
      .sort({ createdAt: -1 });

    res.status(200).json(parents);
  } catch (error) {
    console.error("Get parents error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single parent
// @route   GET /api/parents/:id
// @access  Private (Admin)
export const getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "children",
        populate: { path: "class", select: "name grade" },
      });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    res.status(200).json(parent);
  } catch (error) {
    console.error("Get parent by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new parent
// @route   POST /api/parents
// @access  Private (Admin)
export const createParent = async (req, res) => {
  try {
    const { email, password = "parent123", ...parentData } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Auto-generate parent ID if not provided
    let parentId = parentData.parentId;
    if (!parentId) {
      parentId = await generateId("P", Parent);
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: `${parentData.firstName} ${parentData.lastName}`,
      email,
      password: hashedPassword,
      role: "parent",
    });

    // Create parent
    const parent = await Parent.create({
      ...parentData,
      parentId,
      user: user._id,
      email,
    });

    // Populate before sending response
    const populatedParent = await Parent.findById(parent._id).populate("user", "name email");

    res.status(201).json(populatedParent);
  } catch (error) {
    console.error("Create parent error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update parent
// @route   PUT /api/parents/:id
// @access  Private (Admin)
export const updateParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("children", "studentId firstName lastName class");

    res.status(200).json(updatedParent);
  } catch (error) {
    console.error("Update parent error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete parent
// @route   DELETE /api/parents/:id
// @access  Private (Admin)
export const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Remove parent from children
    if (parent.children && parent.children.length > 0) {
      await Student.updateMany(
        { _id: { $in: parent.children } },
        { $unset: { parent: "" } }
      );
    }

    // Delete associated user account
    if (parent.user) {
      await User.findByIdAndDelete(parent.user);
    }

    await parent.deleteOne();
    res.status(200).json({ message: "Parent deleted successfully" });
  } catch (error) {
    console.error("Delete parent error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Link child to parent
// @route   POST /api/parents/:id/link-child
// @access  Private (Admin)
export const linkChild = async (req, res) => {
  try {
    const { studentId } = req.body;
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Add child to parent
    if (!parent.children.includes(studentId)) {
      parent.children.push(studentId);
      await parent.save();
    }

    // Link parent to student
    student.parent = parent._id;
    await student.save();

    const updatedParent = await Parent.findById(parent._id)
      .populate("user", "name email")
      .populate("children", "studentId firstName lastName class");

    res.status(200).json(updatedParent);
  } catch (error) {
    console.error("Link child error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unlink child from parent
// @route   POST /api/parents/:id/unlink-child
// @access  Private (Admin)
export const unlinkChild = async (req, res) => {
  try {
    const { studentId } = req.body;
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Remove child from parent
    parent.children = parent.children.filter((child) => child.toString() !== studentId);
    await parent.save();

    // Unlink parent from student
    await Student.findByIdAndUpdate(studentId, { $unset: { parent: "" } });

    const updatedParent = await Parent.findById(parent._id)
      .populate("user", "name email")
      .populate("children", "studentId firstName lastName class");

    res.status(200).json(updatedParent);
  } catch (error) {
    console.error("Unlink child error:", error);
    res.status(500).json({ message: error.message });
  }
};

