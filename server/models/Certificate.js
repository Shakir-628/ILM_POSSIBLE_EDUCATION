import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    certificateType: {
      type: String,
      enum: [
        "transfer",
        "character",
        "bonafide",
        "achievement",
        "completion",
        "participation",
        "merit",
        "conduct",
        "other",
      ],
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    
    // Certificate Content
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    
    // Additional Details (varies by certificate type)
    additionalDetails: {
      // For Transfer Certificate
      reasonForLeaving: String,
      dateOfLeaving: Date,
      tcNumber: String,
      
      // For Achievement Certificate
      achievementTitle: String,
      achievementDate: Date,
      position: String,
      
      // For Participation Certificate
      eventName: String,
      eventDate: Date,
      eventType: String,
      
      // For Character/Conduct Certificate
      conductRating: {
        type: String,
        enum: ["excellent", "very-good", "good", "satisfactory"],
      },
      
      // General fields
      academicYear: String,
      remarks: String,
    },
    
    // Template used (optional)
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateTemplate",
    },
    
    // Signatures
    signatures: {
      classTeacher: {
        name: String,
        designation: String,
        signatureImage: String,
      },
      principal: {
        name: String,
        designation: String,
        signatureImage: String,
      },
      other: {
        name: String,
        designation: String,
        signatureImage: String,
      },
    },
    
    // Issue Details
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
    
    // Status
    status: {
      type: String,
      enum: ["draft", "issued", "cancelled", "expired"],
      default: "draft",
    },
    
    // PDF
    pdfPath: String,
    
    // QR Code for verification
    qrCode: String,
    verificationCode: String,
    
    // Tracking
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
    cancellationDate: Date,
    
    // Download tracking
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Generate unique certificate number before saving
certificateSchema.pre("save", async function (next) {
  if (!this.certificateNumber || this.certificateNumber === "AUTO") {
    const year = new Date().getFullYear();
    const prefix = this.certificateType.substring(0, 3).toUpperCase();
    
    // Find the last certificate of this type
    const lastCert = await mongoose.model("Certificate")
      .findOne({ certificateType: this.certificateType })
      .sort({ certificateNumber: -1 });
    
    let sequence = 1;
    if (lastCert && lastCert.certificateNumber) {
      const lastSeq = parseInt(lastCert.certificateNumber.split("-").pop());
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.certificateNumber = `${prefix}-${year}-${sequence.toString().padStart(4, "0")}`;
  }
  
  // Generate verification code if not exists
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  
  next();
});

// Index for faster queries (certificateNumber already has unique index from schema definition)
certificateSchema.index({ student: 1, certificateType: 1 });
certificateSchema.index({ status: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;

