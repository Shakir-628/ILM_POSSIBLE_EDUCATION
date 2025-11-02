import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
    examType: {
      type: String,
      enum: ["quiz", "midterm", "final", "assignment", "project", "practical"],
      required: true,
    },
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
    },
    remarks: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
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
  },
  {
    timestamps: true,
  }
);

// Calculate percentage and grade before saving
gradeSchema.pre("save", function (next) {
  if (this.marksObtained && this.totalMarks) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;
    
    // Calculate grade based on percentage
    if (this.percentage >= 90) this.grade = "A+";
    else if (this.percentage >= 80) this.grade = "A";
    else if (this.percentage >= 70) this.grade = "B+";
    else if (this.percentage >= 60) this.grade = "B";
    else if (this.percentage >= 50) this.grade = "C+";
    else if (this.percentage >= 40) this.grade = "C";
    else if (this.percentage >= 33) this.grade = "D";
    else this.grade = "F";
  }
  next();
});

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;

