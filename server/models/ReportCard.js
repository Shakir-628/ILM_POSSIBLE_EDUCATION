import mongoose from "mongoose";

const reportCardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["1st", "2nd", "3rd", "annual"],
      required: true,
    },
    
    // Subject-wise Marks
    subjectGrades: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        totalMarks: {
          type: Number,
          required: true,
        },
        obtainedMarks: {
          type: Number,
          required: true,
        },
        grade: {
          type: String,
          enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
        },
        percentage: Number,
        remarks: String,
      },
    ],
    
    // Overall Performance
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
    },
    
    // Attendance
    totalWorkingDays: Number,
    presentDays: Number,
    attendancePercentage: Number,
    
    // Position & Remarks
    classPosition: Number,
    totalStudents: Number,
    
    remarks: {
      classTeacher: String,
      principal: String,
      conduct: {
        type: String,
        enum: ["excellent", "good", "satisfactory", "needs-improvement"],
      },
    },
    
    // Promotion
    promoted: {
      type: Boolean,
      default: false,
    },
    promotedToClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    
    // Status
    status: {
      type: String,
      enum: ["draft", "published", "sent"],
      default: "draft",
    },
    publishedDate: Date,
    
    // PDF
    pdfPath: String,
    
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Calculate percentage and grade before saving
reportCardSchema.pre("save", function (next) {
  // Calculate overall percentage
  if (this.totalMarks && this.obtainedMarks) {
    this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
  }
  
  // Calculate overall grade
  const percentage = this.percentage;
  if (percentage >= 90) this.overallGrade = "A+";
  else if (percentage >= 80) this.overallGrade = "A";
  else if (percentage >= 70) this.overallGrade = "B+";
  else if (percentage >= 60) this.overallGrade = "B";
  else if (percentage >= 50) this.overallGrade = "C+";
  else if (percentage >= 40) this.overallGrade = "C";
  else if (percentage >= 33) this.overallGrade = "D";
  else this.overallGrade = "F";
  
  // Calculate GPA (4.0 scale)
  if (percentage >= 90) this.gpa = 4.0;
  else if (percentage >= 80) this.gpa = 3.7;
  else if (percentage >= 70) this.gpa = 3.3;
  else if (percentage >= 60) this.gpa = 3.0;
  else if (percentage >= 50) this.gpa = 2.5;
  else if (percentage >= 40) this.gpa = 2.0;
  else if (percentage >= 33) this.gpa = 1.0;
  else this.gpa = 0.0;
  
  // Calculate attendance percentage
  if (this.totalWorkingDays && this.presentDays) {
    this.attendancePercentage = (this.presentDays / this.totalWorkingDays) * 100;
  }
  
  next();
});

// Compound index for unique report card per student per term
reportCardSchema.index({ student: 1, academicYear: 1, term: 1 }, { unique: true });

const ReportCard = mongoose.model("ReportCard", reportCardSchema);

export default ReportCard;

