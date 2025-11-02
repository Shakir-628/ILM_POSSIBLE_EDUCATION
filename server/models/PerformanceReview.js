import mongoose from "mongoose";

const performanceReviewSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    reviewPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      term: {
        type: String,
        enum: ["1st", "2nd", "3rd", "annual"],
      },
    },
    academicYear: {
      type: String,
      required: true,
    },
    
    // Performance Metrics
    ratings: {
      teachingQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      classroomManagement: {
        type: Number,
        min: 1,
        max: 5,
      },
      studentEngagement: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      communicationSkills: {
        type: Number,
        min: 1,
        max: 5,
      },
      innovation: {
        type: Number,
        min: 1,
        max: 5,
      },
      collaboration: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    
    // Overall Score
    overallScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    
    // Achievements
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
      },
    ],
    
    // Areas of Improvement
    areasOfImprovement: [String],
    
    // Goals & Objectives
    goals: [
      {
        goal: String,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
        deadline: Date,
      },
    ],
    
    // Comments & Feedback
    strengths: String,
    weaknesses: String,
    recommendations: String,
    teacherComments: String,
    
    // Review Details
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "acknowledged"],
      default: "draft",
    },
    acknowledgedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Calculate overall score before saving
performanceReviewSchema.pre("save", function (next) {
  if (this.ratings) {
    const ratings = Object.values(this.ratings).filter((r) => r !== null && r !== undefined);
    if (ratings.length > 0) {
      this.overallScore = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    }
  }
  next();
});

const PerformanceReview = mongoose.model("PerformanceReview", performanceReviewSchema);

export default PerformanceReview;

