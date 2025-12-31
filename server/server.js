import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import http from "http";
import { requestLogger } from "./middleware/loggingMiddleware.js";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeSocket } from "./config/socket.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import accountingRoutes from "./routes/accountingRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import examScheduleRoutes from "./routes/examScheduleRoutes.js";
import reportCardRoutes from "./routes/reportCardRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import examAnalyticsRoutes from "./routes/examAnalyticsRoutes.js";
import rolePermissionRoutes from "./routes/rolePermissionRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import certificateTemplateRoutes from "./routes/certificateTemplateRoutes.js";
import libraryRoutes from "./routes/library.js";
import transportRoutes from "./routes/transport.js";
import hostelRoutes from "./routes/hostel.js";
import superadminRoutes from "./routes/superadminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Trust proxy to get correct IP addresses
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (should be early in the chain)
app.use(requestLogger);
app.use(morgan("dev"));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "School Management API Running",
    version: "2.0.0",
    features: [
      "Authentication",
      "Students & Teachers Management",
      "Classes & Subjects",
      "Attendance Tracking",
      "Grades Management",
      "Assignments & Submissions",
      "Announcements",
      "Reports (PDF/Excel)",
    ],
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/superadmins", superadminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/exam-schedules", examScheduleRoutes);
app.use("/api/report-cards", reportCardRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/exam-analytics", examAnalyticsRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/certificate-templates", certificateTemplateRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/hostel", hostelRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO ready for connections`);
});
