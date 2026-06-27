import Resource from "../models/Resource.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all resources (filtered by class/subject)
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
  try {
    const { classId, subjectId, type } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(404).json({ message: "Student profile not found" });
      query.class = student.class;
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      // Teachers can see what they uploaded or everything for their class? 
      // Usually, teachers want to see all resources for the subjects they teach.
      // For now, let's filter by the query if provided, otherwise show their own.
      if (!classId && !subjectId) {
        query.teacher = teacher._id;
      }
    }

    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (type) query.type = type;

    const resources = await Resource.find(query)
      .populate("class", "className grade section")
      .populate("subject", "subjectName subjectCode")
      .populate("teacher", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private (Teacher, Admin)
export const createResource = async (req, res) => {
  try {
    const { title, description, type, classId, subjectId, externalUrl } = req.body;

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Only teachers or admins can upload resources" });
    }

    const resourceData = {
      title,
      description,
      type,
      class: classId,
      subject: subjectId,
      teacher: teacher ? teacher._id : req.user._id, // Fallback to user ID if admin
      externalUrl
    };

    if (req.file) {
      resourceData.file = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    const resource = await Resource.create(resourceData);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Teacher, Admin)
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // TODO: Add authorization check so only owning teacher can edit
    Object.assign(resource, req.body);
    
    if (req.file) {
      // Delete old file if exists
      if (resource.file && resource.file.path) {
        fs.unlink(resource.file.path, (err) => {
          if (err) console.error("Error deleting old resource file:", err);
        });
      }
      resource.file = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };
    }

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Teacher, Admin)
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Delete file from disk
    if (resource.file && resource.file.path) {
      fs.unlink(resource.file.path, (err) => {
        if (err) console.error("Error deleting resource file:", err);
      });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download resource file
// @route   GET /api/resources/download/:id
// @access  Private
export const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.file || !resource.file.path) {
      return res.status(404).json({ message: "File not found" });
    }

    const filepath = path.resolve(resource.file.path);
    res.download(filepath, resource.file.filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
};
