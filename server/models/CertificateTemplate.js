import mongoose from "mongoose";

const certificateTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    
    // Template Design
    layout: {
      type: String,
      enum: ["portrait", "landscape"],
      default: "portrait",
    },
    orientation: {
      type: String,
      enum: ["a4", "letter"],
      default: "a4",
    },
    
    // Header Section
    header: {
      showLogo: {
        type: Boolean,
        default: true,
      },
      logoPosition: {
        type: String,
        enum: ["left", "center", "right"],
        default: "center",
      },
      schoolName: {
        type: String,
        default: "{{schoolName}}",
      },
      schoolAddress: {
        type: String,
        default: "{{schoolAddress}}",
      },
      showHeaderBorder: {
        type: Boolean,
        default: true,
      },
    },
    
    // Title Section
    title: {
      text: {
        type: String,
        default: "CERTIFICATE",
      },
      fontSize: {
        type: Number,
        default: 24,
      },
      color: {
        type: String,
        default: "#000000",
      },
      alignment: {
        type: String,
        enum: ["left", "center", "right"],
        default: "center",
      },
    },
    
    // Content Section
    content: {
      template: {
        type: String,
        required: true,
        // Uses placeholders like {{studentName}}, {{className}}, {{date}}, etc.
      },
      fontSize: {
        type: Number,
        default: 12,
      },
      lineHeight: {
        type: Number,
        default: 1.5,
      },
      alignment: {
        type: String,
        enum: ["left", "center", "right", "justify"],
        default: "justify",
      },
    },
    
    // Signature Section
    signatures: {
      showClassTeacher: {
        type: Boolean,
        default: true,
      },
      showPrincipal: {
        type: Boolean,
        default: true,
      },
      showOther: {
        type: Boolean,
        default: false,
      },
      layout: {
        type: String,
        enum: ["horizontal", "vertical"],
        default: "horizontal",
      },
    },
    
    // Footer Section
    footer: {
      showDate: {
        type: Boolean,
        default: true,
      },
      showCertificateNumber: {
        type: Boolean,
        default: true,
      },
      showQRCode: {
        type: Boolean,
        default: true,
      },
      customText: String,
    },
    
    // Design Customization
    design: {
      backgroundColor: {
        type: String,
        default: "#FFFFFF",
      },
      borderColor: {
        type: String,
        default: "#000000",
      },
      borderWidth: {
        type: Number,
        default: 2,
      },
      showWatermark: {
        type: Boolean,
        default: false,
      },
      watermarkText: String,
      watermarkOpacity: {
        type: Number,
        default: 0.1,
      },
    },
    
    // Available Placeholders (for documentation)
    availablePlaceholders: [
      {
        placeholder: String,
        description: String,
      },
    ],
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    
    // Usage statistics
    usageCount: {
      type: Number,
      default: 0,
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default template per certificate type
certificateTemplateSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("CertificateTemplate").updateMany(
      { certificateType: this.certificateType, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for faster queries
certificateTemplateSchema.index({ certificateType: 1, isActive: 1 });
certificateTemplateSchema.index({ isDefault: 1 });

const CertificateTemplate = mongoose.model("CertificateTemplate", certificateTemplateSchema);

export default CertificateTemplate;

