import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    
    // Student Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    nationality: {
      type: String,
      default: "Pakistani",
    },
    religion: {
      type: String,
    },
    
    // Contact Information
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Pakistan" },
    },
    
    // Parent/Guardian Information
    fatherName: {
      type: String,
      required: true,
    },
    fatherOccupation: String,
    fatherPhone: {
      type: String,
      required: true,
    },
    fatherEmail: String,
    
    motherName: {
      type: String,
      required: true,
    },
    motherOccupation: String,
    motherPhone: String,
    motherEmail: String,
    
    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    guardianEmail: String,
    
    // Academic Information
    appliedForClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    previousSchool: {
      name: String,
      address: String,
      lastClass: String,
      lastGrade: String,
      leavingYear: String,
    },
    
    // Documents
    documents: [
      {
        documentType: {
          type: String,
          enum: [
            "birth-certificate",
            "previous-school-certificate",
            "photo",
            "id-proof",
            "address-proof",
            "medical-certificate",
            "other",
          ],
        },
        filename: String,
        path: String,
        mimetype: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Application Status
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected", "enrolled", "withdrawn"],
      default: "pending",
    },
    
    // Merit & Test Scores
    entranceTestDate: Date,
    entranceTestScore: Number,
    interviewDate: Date,
    interviewScore: Number,
    totalMeritScore: Number,
    meritRank: Number,
    
    // Fees
    applicationFee: {
      type: Number,
      default: 0,
    },
    applicationFeePaid: {
      type: Boolean,
      default: false,
    },
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "online"],
    },
    transactionId: String,
    
    // Enrollment
    enrolledStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    enrollmentDate: Date,
    
    // Review & Comments
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: Date,
    reviewComments: String,
    
    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Generate application number
admissionSchema.pre("save", async function (next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Admission").countDocuments({
      academicYear: this.academicYear,
    });
    this.applicationNumber = `APP${year}${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

const Admission = mongoose.model("Admission", admissionSchema);

export default Admission;

