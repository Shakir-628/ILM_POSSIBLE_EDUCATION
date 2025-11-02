import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Parent from "../models/Parent.js";

/**
 * Generate next sequential ID for students
 * Format: S001, S002, S003, etc.
 */
export const generateStudentId = async () => {
  try {
    // Get the last student by ID
    const lastStudent = await Student.findOne()
      .sort({ studentId: -1 })
      .select("studentId")
      .lean();

    if (!lastStudent || !lastStudent.studentId) {
      return "S001";
    }

    // Extract number from last ID (e.g., "S005" -> 5)
    const lastNumber = parseInt(lastStudent.studentId.replace(/\D/g, "")) || 0;
    const nextNumber = lastNumber + 1;

    // Format with leading zeros (e.g., 6 -> "S006")
    return `S${String(nextNumber).padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating student ID:", error);
    // Fallback to timestamp-based ID
    return `S${Date.now().toString().slice(-6)}`;
  }
};

/**
 * Generate next sequential ID for teachers
 * Format: T001, T002, T003, etc.
 */
export const generateTeacherId = async () => {
  try {
    // Get the last teacher by ID
    const lastTeacher = await Teacher.findOne()
      .sort({ teacherId: -1 })
      .select("teacherId")
      .lean();

    if (!lastTeacher || !lastTeacher.teacherId) {
      return "T001";
    }

    // Extract number from last ID (e.g., "T005" -> 5)
    const lastNumber = parseInt(lastTeacher.teacherId.replace(/\D/g, "")) || 0;
    const nextNumber = lastNumber + 1;

    // Format with leading zeros (e.g., 6 -> "T006")
    return `T${String(nextNumber).padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating teacher ID:", error);
    // Fallback to timestamp-based ID
    return `T${Date.now().toString().slice(-6)}`;
  }
};

/**
 * Check if student ID already exists
 */
export const isStudentIdUnique = async (studentId) => {
  const existing = await Student.findOne({ studentId });
  return !existing;
};

/**
 * Check if teacher ID already exists
 */
export const isTeacherIdUnique = async (teacherId) => {
  const existing = await Teacher.findOne({ teacherId });
  return !existing;
};

/**
 * Generate unique student ID (with retry logic)
 */
export const generateUniqueStudentId = async () => {
  let studentId = await generateStudentId();
  let attempts = 0;
  const maxAttempts = 10;

  while (!(await isStudentIdUnique(studentId)) && attempts < maxAttempts) {
    // If ID exists, try next number
    const number = parseInt(studentId.replace(/\D/g, "")) + 1;
    studentId = `S${String(number).padStart(3, "0")}`;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Fallback to timestamp-based unique ID
    studentId = `S${Date.now().toString().slice(-6)}`;
  }

  return studentId;
};

/**
 * Generate unique teacher ID (with retry logic)
 */
export const generateUniqueTeacherId = async () => {
  let teacherId = await generateTeacherId();
  let attempts = 0;
  const maxAttempts = 10;

  while (!(await isTeacherIdUnique(teacherId)) && attempts < maxAttempts) {
    // If ID exists, try next number
    const number = parseInt(teacherId.replace(/\D/g, "")) + 1;
    teacherId = `T${String(number).padStart(3, "0")}`;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Fallback to timestamp-based unique ID
    teacherId = `T${Date.now().toString().slice(-6)}`;
  }

  return teacherId;
};

/**
 * Generic ID generator for any model
 * @param {string} prefix - ID prefix (e.g., 'S', 'T', 'P')
 * @param {Model} Model - Mongoose model
 * @param {string} idField - Field name for the ID (default: 'id')
 * @returns {Promise<string>} - Generated ID
 */
export const generateId = async (prefix, Model, idField = null) => {
  try {
    // Determine the ID field name
    const fieldName = idField || `${prefix.toLowerCase()}Id`;
    
    // Create a dynamic query
    const query = {};
    const lastRecord = await Model.findOne()
      .sort({ [fieldName]: -1 })
      .select(fieldName)
      .lean();

    if (!lastRecord || !lastRecord[fieldName]) {
      return `${prefix}001`;
    }

    // Extract number from last ID
    const lastNumber = parseInt(lastRecord[fieldName].replace(/\D/g, "")) || 0;
    const nextNumber = lastNumber + 1;

    // Format with leading zeros
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
  } catch (error) {
    console.error(`Error generating ${prefix} ID:`, error);
    // Fallback to timestamp-based ID
    return `${prefix}${Date.now().toString().slice(-6)}`;
  }
};

export default {
  generateStudentId,
  generateTeacherId,
  isStudentIdUnique,
  isTeacherIdUnique,
  generateUniqueStudentId,
  generateUniqueTeacherId,
  generateId,
};

