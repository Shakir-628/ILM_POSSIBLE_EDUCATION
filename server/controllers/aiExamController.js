import {
  AIExam,
  StudentExamAttempt,
  QuestionBank,
  ExamPerformanceAnalytics,
} from "../models/AIExam.js";
import Notification from "../models/Notification.js";
import aiService from "../services/aiService.js";
import Subject from "../models/Subject.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";
import axios from "axios";
import mongoose from 'mongoose';

// ==================== EXAM CREATION & MANAGEMENT ====================

// @desc    Create a new AI exam
// @route   POST /api/ai-exams
// @access  Private (Teachers/Admins)
export const createAIExam = async (req, res) => {
  try {
    const { title, description, examType, status, subject, class: classId, examSettings, questions, scheduledDate, startTime, endTime, tags } = req.body;

    // Log incoming request
    console.log('📝 Create AI Exam request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User info:', {
      userId: req.user?._id,
      role: req.user?.role
    });

    // Ensure authenticated user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Validate required fields
    if (!title || !subject || !classId || !examSettings) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, subject, class, examSettings",
      });
    }

    // Convert subject and classId to ObjectId if they are strings
    let subjectId = subject;
    let classIdObj = classId;

    // Handle subject lookup
    if (typeof subject === 'string') {
      if (mongoose.Types.ObjectId.isValid(subject)) {
        // It's a valid ObjectId
        subjectId = new mongoose.Types.ObjectId(subject);
      } else {
        // Try to find by name (subjectName or subjectCode)
        const foundSubject = await Subject.findOne({
          $or: [
            { subjectName: { $regex: subject, $options: 'i' } },
            { subjectCode: { $regex: subject, $options: 'i' } }
          ]
        });
        if (!foundSubject) {
          return res.status(400).json({
            success: false,
            message: `Subject "${subject}" not found. Please provide a valid subject name, code, or ObjectId.`,
          });
        }
        subjectId = foundSubject._id;
      }
    }

    // Handle class lookup
    if (typeof classId === 'string') {
      if (mongoose.Types.ObjectId.isValid(classId)) {
        // It's a valid ObjectId
        classIdObj = new mongoose.Types.ObjectId(classId);
      } else {
        // Try to find by name
        const foundClass = await Class.findOne({
          className: { $regex: classId, $options: 'i' }
        });
        if (!foundClass) {
          return res.status(400).json({
            success: false,
            message: `Class "${classId}" not found. Please provide a valid class name or ObjectId.`,
          });
        }
        classIdObj = foundClass._id;
      }
    }

    // Ensure examSettings.numberOfQuestions is set
    const settings = {
      ...examSettings,
      numberOfQuestions: examSettings.numberOfQuestions || (questions ? questions.length : 0),
    };

    // Final validation of ObjectIds
    if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(classIdObj)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Subject or Class ID format",
      });
    }

    const exam = new AIExam({
      title,
      description,
      examType: examType || "test",
      subject: subjectId,
      class: classIdObj,
      createdBy: req.user._id,
      examSettings: settings,
      questions: (questions || []).map(q => {
        const qId = q.questionId || q._id || q.id;
        const validId = mongoose.Types.ObjectId.isValid(qId) ? qId : new mongoose.Types.ObjectId();

        // Create a new object without the original potentially invalid IDs
        const { questionId: oldQId, _id: oldId, id: oldLocalId, ...rest } = q;
        return {
          ...rest,
          questionId: validId
        };
      }),
      status: status || "draft",
    });

    if (scheduledDate && scheduledDate !== "") exam.scheduledDate = scheduledDate;
    if (startTime && startTime !== "") exam.startTime = startTime;
    if (endTime && endTime !== "") exam.endTime = endTime;
    if (tags) exam.tags = tags;

    await exam.save();
    await exam.populate("subject class createdBy");

    res.status(201).json({
      success: true,
      message: "AI Exam created successfully",
      data: exam,
    });
  } catch (error) {
    console.error("❌ Create AI Exam error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Get all AI exams
// @route   GET /api/ai-exams
// @access  Private
export const getAllAIExams = async (req, res) => {
  try {
    const { examType, subject, class: classId, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (examType) filter.examType = examType;
    if (subject) filter.subject = subject;
    if (classId) filter.class = classId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const exams = await AIExam.find(filter)
      .populate("subject class createdBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AIExam.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: exams.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: exams,
    });
  } catch (error) {
    console.error("Get AI Exams error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get AI exam by ID
// @route   GET /api/ai-exams/:id
// @access  Private
export const getAIExamById = async (req, res) => {
  try {
    const examId = req.params.examId || req.params.id;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid AI Exam ID is required'
      });
    }

    const exam = await AIExam.findById(examId)
      .populate("subject class createdBy")
      .select("-questions.correctAnswer -questions.options.isCorrect");
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Get AI Exam error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update AI exam
// @route   PUT /api/ai-exams/:id
// @access  Private (Creator/Admin)
export const updateAIExam = async (req, res) => {
  try {
    const { title, description, examSettings, questions, status, scheduledDate, startTime, endTime } = req.body;

    const examId = req.params.examId || req.params.id;
    if (!examId) {
      return res.status(400).json({ success: false, message: 'Missing exam id' });
    }

    let exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    // Check authorization
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this exam",
      });
    }

    // Update fields
    if (title) exam.title = title;
    if (description) exam.description = description;
    if (examSettings) exam.examSettings = { ...exam.examSettings, ...examSettings };
    if (questions) {
      exam.questions = questions.map(q => {
        const qId = q.questionId || q._id || q.id;
        const validId = mongoose.Types.ObjectId.isValid(qId) ? qId : new mongoose.Types.ObjectId();

        // Create a new object without the original potentially invalid IDs
        const { questionId: oldQId, _id: oldId, id: oldLocalId, ...rest } = q;
        return {
          ...rest,
          questionId: validId
        };
      });
    }
    if (status) exam.status = status;
    if (scheduledDate) exam.scheduledDate = scheduledDate;
    if (startTime) exam.startTime = startTime;
    if (endTime) exam.endTime = endTime;

    await exam.save();
    await exam.populate("subject class createdBy");

    res.status(200).json({
      success: true,
      message: "AI Exam updated successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Update AI Exam error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete AI exam
// @route   DELETE /api/ai-exams/:id
// @access  Private (Creator/Admin)
export const deleteAIExam = async (req, res) => {
  try {
    const examId = req.params.examId || req.params.id;
    if (!examId) {
      return res.status(400).json({ success: false, message: 'Missing exam id' });
    }

    const exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    // Check authorization
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this exam",
      });
    }

    await AIExam.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "AI Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete AI Exam error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== QUESTION MANAGEMENT ====================

// @desc    Add question to exam
// @route   POST /api/ai-exams/:id/questions
// @access  Private (Creator/Admin)
export const addQuestionToExam = async (req, res) => {
  try {
    const { questionText, questionType, difficulty, marks, options, correctAnswer, answerExplanation, imageUrl, topicTags } = req.body;

    const examId = req.params.examId || req.params.id;
    if (!examId) {
      return res.status(400).json({ success: false, message: 'Missing exam id' });
    }

    let exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    // Check authorization
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this exam",
      });
    }

    const question = {
      questionId: new mongoose.Types.ObjectId(),
      questionText,
      questionType,
      difficulty: difficulty || "medium",
      marks: marks || 1,
      options: options || [],
      correctAnswer,
      answerExplanation,
      imageUrl,
      topicTags: topicTags || [],
      aiGenerated: false,
    };

    exam.questions.push(question);
    exam.examSettings.numberOfQuestions = exam.questions.length;
    await exam.save();

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Add question error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update question in exam
// @route   PUT /api/ai-exams/:examId/questions/:questionId
// @access  Private (Creator/Admin)
export const updateQuestionInExam = async (req, res) => {
  try {
    const { examId, questionId } = req.params;
    const updates = req.body;

    let exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    // Check authorization
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this exam",
      });
    }

    const questionIndex = exam.questions.findIndex((q) => q.questionId.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    exam.questions[questionIndex] = { ...exam.questions[questionIndex], ...updates };
    await exam.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete question from exam
// @route   DELETE /api/ai-exams/:examId/questions/:questionId
// @access  Private (Creator/Admin)
export const deleteQuestionFromExam = async (req, res) => {
  try {
    const { examId, questionId } = req.params;

    let exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    // Check authorization
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this exam",
      });
    }

    exam.questions = exam.questions.filter((q) => q.questionId.toString() !== questionId);
    exam.examSettings.numberOfQuestions = exam.questions.length;
    await exam.save();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== EXAM ATTEMPT ====================

// @desc    Start exam attempt
// @route   POST /api/ai-exams/:id/start
// @access  Private (Students)
export const startExamAttempt = async (req, res) => {
  try {
    const examId = req.params.examId || req.params.id;

    if (!examId) {
      return res.status(400).json({ success: false, message: 'Missing exam id' });
    }

    const exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    // Check if exam is available
    if (exam.status !== "scheduled" && exam.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: `Exam is ${exam.status}. Cannot start exam.`,
      });
    }

    // Find student profile for the user
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Only students can attempt exams.",
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await StudentExamAttempt.findOne({
      exam: examId,
      student: student._id,
      status: "in-progress",
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Resuming existing exam attempt",
        data: existingAttempt,
      });
    }

    const attempt = new StudentExamAttempt({
      exam: examId,
      student: student._id,
      startTime: new Date(),
      answers: exam.questions.map((q) => ({
        questionId: q.questionId || q._id,
        selectedOption: null,
        selectedAnswer: null,
        isCorrect: false,
        marksObtained: 0,
        timeSpentOnQuestion: 0,
        flagged: false,
      })),
      totalMarks: exam.examSettings.totalMarks,
      status: "in-progress",
    });

    await attempt.save();
    await attempt.populate("exam student");

    res.status(201).json({
      success: true,
      message: "Exam attempt started",
      data: attempt,
    });
  } catch (error) {
    console.error("Start exam error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Save answer to exam
// @route   PUT /api/exam-attempts/:attemptId/answer
// @access  Private (Students)
export const saveAnswerToExam = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, selectedAnswer, timeSpentOnQuestion } = req.body;

    const attempt = await StudentExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    // Verify ownership
    const student = await Student.findOne({ user: req.user._id });
    if (!student || attempt.student.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this attempt",
      });
    }

    // Check if exam time is not exceeded
    const exam = await AIExam.findById(attempt.exam);
    const timeElapsed = (new Date() - attempt.startTime) / 1000; // in seconds
    const maxTime = exam.examSettings.duration * 60; // convert minutes to seconds

    if (timeElapsed > maxTime) {
      attempt.status = "submitted";
      await attempt.save();
      return res.status(400).json({
        success: false,
        message: "Exam time has exceeded",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    // Find and update answer
    const answerIndex = attempt.answers.findIndex((a) => {
      const qId = a.questionId || a._id;
      return qId && qId.toString() === questionId;
    });

    if (answerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Question with ID ${questionId} not found in this exam attempt. Try starting a new attempt.`,
      });
    }

    // Find the question to check if answer is correct
    const question = exam.questions.find((q) => {
      const qId = q.questionId || q._id;
      return qId && qId.toString() === questionId;
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found in original exam definition.",
      });
    }

    const isCorrect = selectedOption === question.correctAnswer || selectedAnswer === question.correctAnswer;

    attempt.answers[answerIndex] = {
      questionId,
      selectedOption,
      selectedAnswer,
      isCorrect,
      marksObtained: isCorrect ? question.marks : 0,
      timeSpentOnQuestion: timeSpentOnQuestion || 0,
      flagged: false,
    };

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: attempt.answers[answerIndex],
    });
  } catch (error) {
    console.error("Save answer error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit exam attempt
// @route   POST /api/exam-attempts/:attemptId/submit
// @access  Private (Students)
export const submitExamAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    let attempt = await StudentExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    // Verify ownership
    const student = await Student.findOne({ user: req.user._id });
    if (!student || attempt.student.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit this attempt",
      });
    }

    // Calculate score
    let totalMarksObtained = 0;
    attempt.answers.forEach((answer) => {
      totalMarksObtained += answer.marksObtained || 0;
    });

    const exam = await AIExam.findById(attempt.exam);
    const percentage = (totalMarksObtained / exam.examSettings.totalMarks) * 100;
    const isPassed = percentage >= exam.examSettings.passingMarks;

    attempt.totalMarksObtained = totalMarksObtained;
    attempt.percentage = percentage;
    attempt.isPassed = isPassed;
    attempt.status = "submitted";
    attempt.submittedTime = new Date();
    attempt.duration = (attempt.submittedTime - attempt.startTime) / 1000; // in seconds

    // Assign grade
    if (percentage >= 90) attempt.grade = "A+";
    else if (percentage >= 80) attempt.grade = "A";
    else if (percentage >= 70) attempt.grade = "B";
    else if (percentage >= 60) attempt.grade = "C";
    else if (percentage >= 50) attempt.grade = "D";
    else attempt.grade = "F";

    await attempt.save();

    // Generate AI Feedback
    await generateAIFeedback(attempt, exam);

    // Update exam analytics
    await updateExamAnalytics(exam._id, attempt);

    await attempt.populate("exam student");

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data: attempt,
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get exam attempt by ID
// @route   GET /api/ai-exams/attempts/:attemptId
// @access  Private
export const getExamAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await StudentExamAttempt.findById(attemptId)
      .populate("exam student");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("Get exam attempt error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== RESULTS & ANALYTICS ====================

// @desc    Get exam results
// @route   GET /api/ai-exams/:examId/results
// @access  Private
export const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const exam = await AIExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "AI Exam not found",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const attempts = await StudentExamAttempt.find({
      exam: examId,
      status: { $in: ["submitted", "evaluated"] },
    })
      .populate("student")
      .sort({ submittedTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudentExamAttempt.countDocuments({
      exam: examId,
      status: { $in: ["submitted", "evaluated"] },
    });

    // Calculate statistics
    const totalAttempts = total;
    const passedAttempts = await StudentExamAttempt.countDocuments({
      exam: examId,
      status: { $in: ["submitted", "evaluated"] },
      isPassed: true,
    });
    const averageScore = (
      await StudentExamAttempt.aggregate([
        {
          $match: {
            exam: new mongoose.Types.ObjectId(examId),
            status: { $in: ["submitted", "evaluated"] },
          },
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: "$totalMarksObtained" },
          },
        },
      ])
    )[0]?.avgScore || 0;

    res.status(200).json({
      success: true,
      count: attempts.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      statistics: {
        totalAttempts,
        passedAttempts,
        passPercentage: ((passedAttempts / totalAttempts) * 100).toFixed(2),
        averageScore: averageScore.toFixed(2),
      },
      data: attempts,
    });
  } catch (error) {
    console.error("Get exam results error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student's exam performance analytics
// @route   GET /api/exam-attempts/:attemptId/analytics
// @access  Private
export const getExamAttemptAnalytics = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await StudentExamAttempt.findById(attemptId)
      .populate("exam student");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    const exam = await AIExam.findById(attempt.exam._id);

    // Calculate question-wise analytics
    const questionAnalytics = attempt.answers.map((answer, index) => {
      const question = exam.questions.find((q) => q.questionId.toString() === answer.questionId.toString());
      return {
        questionNumber: index + 1,
        questionText: question?.questionText,
        difficulty: question?.difficulty,
        timeSpent: answer.timeSpentOnQuestion,
        isCorrect: answer.isCorrect,
        marksObtained: answer.marksObtained,
        maxMarks: question?.marks,
        explanation: question?.answerExplanation,
      };
    });

    // Topic-wise performance
    const topicPerformance = {};
    attempt.answers.forEach((answer, index) => {
      const question = exam.questions[index];
      if (question.topicTags && question.topicTags.length > 0) {
        question.topicTags.forEach((tag) => {
          if (!topicPerformance[tag]) {
            topicPerformance[tag] = { correct: 0, total: 0 };
          }
          topicPerformance[tag].total += 1;
          if (answer.isCorrect) topicPerformance[tag].correct += 1;
        });
      }
    });

    const topicAnalytics = Object.keys(topicPerformance).map((topic) => ({
      topic,
      accuracy: ((topicPerformance[topic].correct / topicPerformance[topic].total) * 100).toFixed(2),
      correct: topicPerformance[topic].correct,
      total: topicPerformance[topic].total,
    }));

    res.status(200).json({
      success: true,
      data: {
        attemptOverview: {
          totalMarks: attempt.totalMarksObtained,
          maxMarks: attempt.totalMarks,
          percentage: attempt.percentage.toFixed(2),
          grade: attempt.grade,
          isPassed: attempt.isPassed,
          duration: `${Math.floor(attempt.duration / 60)} mins ${attempt.duration % 60} secs`,
        },
        questionAnalytics,
        topicAnalytics,
        aiFeedback: attempt.aiFeedback,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

async function generateAIFeedback(attempt, exam) {
  try {
    // Analyze student's weak and strong areas
    const topicsPerformance = {};
    const difficultyPerformance = { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } };

    attempt.answers.forEach((answer, index) => {
      const question = exam.questions[index];
      if (question.topicTags) {
        question.topicTags.forEach((tag) => {
          if (!topicsPerformance[tag]) {
            topicsPerformance[tag] = { correct: 0, total: 0 };
          }
          topicsPerformance[tag].total += 1;
          if (answer.isCorrect) topicsPerformance[tag].correct += 1;
        });
      }

      const difficulty = question.difficulty || "medium";
      difficultyPerformance[difficulty].t += 1;
      if (answer.isCorrect) difficultyPerformance[difficulty].c += 1;
    });

    const strongAreas = Object.keys(topicsPerformance)
      .filter((topic) => (topicsPerformance[topic].correct / topicsPerformance[topic].total) * 100 >= 70)
      .slice(0, 3);

    const weakAreas = Object.keys(topicsPerformance)
      .filter((topic) => (topicsPerformance[topic].correct / topicsPerformance[topic].total) * 100 < 50)
      .slice(0, 3);

    const recommendations = weakAreas.map((area) => `Review and practice more on: ${area}`);

    attempt.aiFeedback = {
      strongAreas,
      weakAreas,
      recommendations,
      conceptualGaps: weakAreas,
    };

    await attempt.save();
  } catch (error) {
    console.error("Generate AI feedback error:", error);
  }
}

async function updateExamAnalytics(examId, attempt) {
  try {
    const exam = await AIExam.findById(examId);

    const allAttempts = await StudentExamAttempt.find({
      exam: examId,
      status: { $in: ["submitted", "evaluated"] },
    });

    const totalMarks = allAttempts.reduce((sum, a) => sum + (a.totalMarksObtained || 0), 0);
    const avgScore = totalMarks / allAttempts.length;
    const passedCount = allAttempts.filter((a) => a.isPassed).length;

    exam.averageScore = parseFloat(avgScore.toFixed(2));
    exam.highestScore = Math.max(...allAttempts.map((a) => a.totalMarksObtained));
    exam.lowestScore = Math.min(...allAttempts.map((a) => a.totalMarksObtained));
    exam.passPercentage = ((passedCount / allAttempts.length) * 100).toFixed(2);
    exam.totalAttempts = allAttempts.length;
    exam.totalPassed = passedCount;

    await exam.save();
  } catch (error) {
    console.error("Update exam analytics error:", error);
  }
}

// @desc    Generate AI questions using AI service (Google Gemini)
// @route   POST /api/ai-exams/:id/generate-questions
// @access  Private (Teachers/Admins)
export const generateAIQuestions = async (req, res) => {
  try {
    const examId = req.params.examId || req.params.id;

    if (!examId) {
      return res.status(400).json({ success: false, message: 'Missing exam id' });
    }
    const { topic, difficulty, numberOfQuestions, questionType } = req.body;

    // Handle 'new' exam case where no record exists yet
    if (examId !== 'new') {
      const exam = await AIExam.findById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "AI Exam not found",
        });
      }

      // Check authorization only for existing exams
      if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }
    }

    // Call AI service to generate questions
    const generatedQuestions = await aiService.generateQuestions(topic, difficulty, numberOfQuestions, questionType);

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate AI questions",
      });
    }

    res.status(200).json({
      success: true,
      message: "Questions generated successfully",
      data: {
        topic,
        difficulty,
        numberOfQuestions: generatedQuestions.length,
        generatedQuestions: generatedQuestions,
      },
    });
  } catch (error) {
    console.error("Generate AI questions error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export default {
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
};
