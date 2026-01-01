import mongoose from "mongoose";

// AI-Based Exam/Test Schema
const aiExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    examType: {
      type: String,
      enum: ["quiz", "test", "mid-term", "final", "practice", "mock"],
      default: "test",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Exam Configuration
    examSettings: {
      duration: {
        type: Number, // in minutes
        required: true,
        default: 60,
      },
      totalMarks: {
        type: Number,
        required: true,
        default: 100,
      },
      passingMarks: {
        type: Number,
        default: 40,
      },
      numberOfQuestions: {
        type: Number,
        required: true,
      },
      questionsPerPage: {
        type: Number,
        default: 5,
      },
      showResults: {
        type: Boolean,
        default: true,
      },
      showAnswers: {
        type: Boolean,
        default: false,
      },
      allowReview: {
        type: Boolean,
        default: true,
      },
      randomizeQuestions: {
        type: Boolean,
        default: true,
      },
      randomizeOptions: {
        type: Boolean,
        default: true,
      },
      negativeMarking: {
        type: Boolean,
        default: false,
      },
      negativeMarkingValue: Number,
      immediateScoring: {
        type: Boolean,
        default: true,
      },
    },

    // Questions (embedded)
    questions: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        questionText: String,
        questionType: {
          type: String,
          enum: ["mcq", "short-answer", "essay", "fill-blank", "true-false", "match", "numeric"],
          default: "mcq",
        },
        subject: String,
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        marks: {
          type: Number,
          default: 1,
        },
        options: [
          {
            optionText: String,
            isCorrect: Boolean,
            explanation: String,
          },
        ],
        correctAnswer: String,
        answerExplanation: String,
        imageUrl: String,
        topicTags: [String],
        aiGenerated: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Scheduling
    scheduledDate: Date,
    startTime: String,
    endTime: String,

    // Status
    status: {
      type: String,
      enum: ["draft", "scheduled", "ongoing", "completed", "archived"],
      default: "draft",
    },

    // Analytics
    averageScore: Number,
    highestScore: Number,
    lowestScore: Number,
    passPercentage: Number,
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalPassed: {
      type: Number,
      default: 0,
    },

    // AI Features
    aiFeatures: {
      autoGenerateQuestions: {
        type: Boolean,
        default: false,
      },
      autoGradeEssay: {
        type: Boolean,
        default: false,
      },
      detectCheating: {
        type: Boolean,
        default: false,
      },
      aiAnalytics: {
        type: Boolean,
        default: true,
      },
    },

    // Tags & Categories
    tags: [String],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Visibility
    isPublic: {
      type: Boolean,
      default: false,
    },
    allowedClasses: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

// Student Exam Attempt Schema
const studentExamAttemptSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIExam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    submittedTime: Date,
    duration: Number, // in seconds

    // Answers
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
        selectedAnswer: String,
        isCorrect: Boolean,
        marksObtained: Number,
        timeSpentOnQuestion: Number, // in seconds
        flagged: Boolean,
      },
    ],

    // Scoring
    totalMarksObtained: {
      type: Number,
      default: 0,
    },
    totalMarks: Number,
    percentage: Number,
    grade: String,
    status: {
      type: String,
      enum: ["not-started", "in-progress", "submitted", "evaluated"],
      default: "not-started",
    },
    isPassed: Boolean,

    // Proctoring & Security
    cheatingDetected: {
      type: Boolean,
      default: false,
    },
    cheatingFlags: [
      {
        type: String,
        flagType: String,
        description: String,
        timestamp: Date,
      },
    ],

    // AI Feedback
    aiFeedback: {
      strongAreas: [String],
      weakAreas: [String],
      recommendations: [String],
      conceptualGaps: [String],
    },

    // Review
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewNotes: String,

    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Question Bank Schema (for storing reusable questions)
const questionBankSchema = new mongoose.Schema(
  {
    title: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    questions: [
      {
        questionText: String,
        questionType: String,
        difficulty: String,
        marks: Number,
        options: [
          {
            optionText: String,
            isCorrect: Boolean,
          },
        ],
        correctAnswer: String,
        answerExplanation: String,
        topicTags: [String],
        aiGenerated: Boolean,
      },
    ],
    totalQuestions: Number,
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Exam Performance Analytics Schema
const examPerformanceAnalyticsSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIExam",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    // Performance Metrics
    totalAttempts: Number,
    bestScore: Number,
    averageScore: Number,
    improvementTrend: [
      {
        attemptNumber: Number,
        score: Number,
        date: Date,
      },
    ],

    // Question-wise Analysis
    questionAnalysis: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        timesAttempted: Number,
        timesCorrect: Number,
        successRate: Number,
        averageTimeSpent: Number,
        difficulty: String,
      },
    ],

    // Topic-wise Analysis
    topicWisePerformance: [
      {
        topicName: String,
        questionsAttempted: Number,
        correctAnswers: Number,
        accuracy: Number,
        strengthLevel: String,
      },
    ],

    // AI Insights
    aiInsights: {
      learningPace: String,
      strengthAreas: [String],
      improvementAreas: [String],
      recommendedStudyMaterial: [String],
      nextSteps: [String],
    },

    // Comparison
    classAverageScore: Number,
    studentRank: Number,
    percentileScore: Number,
  },
  { timestamps: true }
);

export const AIExam = mongoose.model("AIExam", aiExamSchema);
export const StudentExamAttempt = mongoose.model(
  "StudentExamAttempt",
  studentExamAttemptSchema
);
export const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
export const ExamPerformanceAnalytics = mongoose.model(
  "ExamPerformanceAnalytics",
  examPerformanceAnalyticsSchema
);
