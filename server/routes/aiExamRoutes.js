import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createAIExam,
  getAllAIExams,
  getAIExamById,
  updateAIExam,
  deleteAIExam,
  addQuestionToExam,
  updateQuestionInExam,
  deleteQuestionFromExam,
  startExamAttempt,
  saveAnswerToExam,
  submitExamAttempt,
  getExamResults,
  getExamAttemptById,
  getExamAttemptAnalytics,
  generateAIQuestions,
} from "../controllers/aiExamController.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Exam Management Routes (Teachers/Admins only)
router.post("/", authorize('admin', 'teacher'), createAIExam);
router.get("/", getAllAIExams);
router.get("/:id", getAIExamById);
router.put("/:id", authorize('admin', 'teacher'), updateAIExam);
router.delete("/:id", authorize('admin', 'teacher'), deleteAIExam);

// Question Management Routes (Teachers/Admins only)
router.post("/:id/questions", authorize('admin', 'teacher'), addQuestionToExam);
router.put("/:examId/questions/:questionId", authorize('admin', 'teacher'), updateQuestionInExam);
router.delete("/:examId/questions/:questionId", authorize('admin', 'teacher'), deleteQuestionFromExam);

// AI Question Generation Route (Teachers/Admins only)
router.post("/:id/generate-questions", authorize('admin', 'teacher'), generateAIQuestions);

// Exam Attempt Routes (Students only)
router.post("/:id/start", authorize('student'), startExamAttempt);
router.get("/attempts/:attemptId", getExamAttemptById);
router.put("/attempts/:attemptId/answer", authorize('student'), saveAnswerToExam);
router.post("/attempts/:attemptId/submit", authorize('student'), submitExamAttempt);

// Results & Analytics Routes
router.get("/:examId/results", protect, getExamResults);
router.get("/attempts/:attemptId/analytics", protect, getExamAttemptAnalytics);

export default router;
