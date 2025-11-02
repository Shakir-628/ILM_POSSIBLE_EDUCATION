import mongoose from "mongoose";

const schoolProfileSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    establishedYear: {
      type: Number,
    },
    schoolCode: {
      type: String,
      unique: true,
      trim: true,
    },
    
    // Contact Information
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    alternatePhone: String,
    website: String,
    
    // Address
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Pakistan" },
    },
    
    // Branding
    logo: String,
    primaryColor: {
      type: String,
      default: "#0369a1",
    },
    secondaryColor: {
      type: String,
      default: "#3b82f6",
    },
    
    // Academic
    academicYear: {
      current: String,
      startMonth: { type: Number, default: 4 }, // April
      endMonth: { type: Number, default: 3 }, // March
    },
    
    // Timing
    schoolTimings: {
      startTime: { type: String, default: "08:00" },
      endTime: { type: String, default: "14:00" },
      workingDays: {
        type: [String],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      },
    },
    
    // System Settings
    settings: {
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      timeFormat: { type: String, default: "12-hour" },
      currency: { type: String, default: "PKR" },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "Asia/Karachi" },
      
      // Features
      enableAttendance: { type: Boolean, default: true },
      enableFees: { type: Boolean, default: true },
      enableLibrary: { type: Boolean, default: true },
      enableTransport: { type: Boolean, default: true },
      enableHostel: { type: Boolean, default: true },
      enableSMS: { type: Boolean, default: false },
      enableEmail: { type: Boolean, default: true },
      
      // Security
      sessionTimeout: { type: Number, default: 30 }, // minutes
      passwordMinLength: { type: Number, default: 6 },
      passwordRequireSpecialChar: { type: Boolean, default: false },
      enableTwoFactor: { type: Boolean, default: false },
      maxLoginAttempts: { type: Number, default: 5 },
      
      // Backup
      autoBackup: { type: Boolean, default: false },
      backupFrequency: { type: String, default: "daily" }, // daily, weekly, monthly
      backupTime: { type: String, default: "02:00" },
      lastBackup: Date,
    },
    
    // Social Media
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
    },
    
    // About
    vision: String,
    mission: String,
    description: String,
    
    // Principal/Head
    principal: {
      name: String,
      email: String,
      phone: String,
      photo: String,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SchoolProfile = mongoose.model("SchoolProfile", schoolProfileSchema);

export default SchoolProfile;

