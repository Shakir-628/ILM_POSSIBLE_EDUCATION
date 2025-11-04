import mongoose from "mongoose";
import dotenv from "dotenv";
import Log from "../models/Log.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding logs");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedSystemLogs = async () => {
  try {
    // Clear existing logs
    await Log.deleteMany({});
    console.log("Cleared existing system logs");

    // Get a user for some logs
    const users = await User.find({}).limit(3);
    const adminUser = users.find(u => u.role === 'admin') || users[0];

    // Create sample system logs
    const systemLogs = [
      // Info logs
      {
        level: "info",
        category: "system",
        message: "Server started successfully",
        method: "SYSTEM",
        url: "/",
        statusCode: 200,
        responseTime: 0,
        ip: "127.0.0.1",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        level: "info",
        category: "auth",
        message: "User login successful",
        method: "POST",
        url: "/api/auth/login",
        statusCode: 200,
        responseTime: 245,
        ip: "192.168.1.100",
        user: adminUser?._id,
        userEmail: adminUser?.email,
        userRole: adminUser?.role,
        createdAt: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
      },
      {
        level: "info",
        category: "database",
        message: "Database backup completed successfully",
        method: "SYSTEM",
        url: "/api/backup",
        statusCode: 200,
        responseTime: 5432,
        ip: "127.0.0.1",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      
      // Warning logs
      {
        level: "warn",
        category: "api",
        message: "API rate limit approaching threshold (80% used)",
        method: "GET",
        url: "/api/students",
        statusCode: 200,
        responseTime: 189,
        ip: "192.168.1.105",
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      },
      {
        level: "warn",
        category: "security",
        message: "Multiple failed login attempts detected",
        method: "POST",
        url: "/api/auth/login",
        statusCode: 401,
        responseTime: 120,
        ip: "203.45.67.89",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      
      // Error logs
      {
        level: "error",
        category: "database",
        message: "Database connection timeout",
        method: "GET",
        url: "/api/students",
        statusCode: 500,
        responseTime: 30000,
        ip: "192.168.1.110",
        errorStack: "Error: Connection timeout\n    at Database.connect (database.js:45)\n    at async fetchStudents (studentController.js:12)",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        level: "error",
        category: "api",
        message: "Failed to fetch student records",
        method: "GET",
        url: "/api/students/12345",
        statusCode: 404,
        responseTime: 145,
        ip: "192.168.1.115",
        errorStack: "Error: Student not found\n    at StudentController.getById (studentController.js:78)",
        user: users[1]?._id,
        userEmail: users[1]?.email,
        userRole: users[1]?.role,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      
      // Debug logs
      {
        level: "debug",
        category: "system",
        message: "Cache cleared successfully",
        method: "DELETE",
        url: "/api/cache/clear",
        statusCode: 200,
        responseTime: 23,
        ip: "127.0.0.1",
        metadata: { cacheSize: "245MB", itemsCleared: 1523 },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      
      // More recent logs
      {
        level: "info",
        category: "user-action",
        message: "Student record updated",
        method: "PUT",
        url: "/api/students/67890",
        statusCode: 200,
        responseTime: 167,
        ip: "192.168.1.120",
        user: adminUser?._id,
        userEmail: adminUser?.email,
        userRole: adminUser?.role,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        level: "info",
        category: "api",
        message: "Grade submitted successfully",
        method: "POST",
        url: "/api/grades",
        statusCode: 201,
        responseTime: 234,
        ip: "192.168.1.125",
        user: users[2]?._id,
        userEmail: users[2]?.email,
        userRole: users[2]?.role,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    ];

    // Filter out logs without users if user doesn't exist
    const validSystemLogs = systemLogs.filter(log => {
      if (log.user && !log.user) return false;
      return true;
    });

    await Log.insertMany(validSystemLogs);
    console.log(`✅ Created ${validSystemLogs.length} system logs`);
  } catch (error) {
    console.error("Error seeding system logs:", error);
  }
};

const seedAuditLogs = async () => {
  try {
    // Clear existing audit logs
    await AuditLog.deleteMany({});
    console.log("Cleared existing audit logs");

    // Get users for audit logs
    const users = await User.find({}).limit(5);
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    const teacherUser = users.find(u => u.role === 'teacher') || users[1];

    // Create sample audit logs
    const auditLogs = [
      // Student actions
      {
        entity: "Student",
        entityId: new mongoose.Types.ObjectId(),
        action: "create",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          name: "Ahmed Khan",
          grade: "Grade 10",
          section: "A",
          rollNumber: "10A001",
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        entity: "Student",
        entityId: new mongoose.Types.ObjectId(),
        action: "update",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          phone: { old: "0300-1234567", new: "0300-9876543" },
          address: { old: "Old Address", new: "New Address" },
        },
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
      },
      
      // Teacher actions
      {
        entity: "Teacher",
        entityId: new mongoose.Types.ObjectId(),
        action: "create",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          firstName: "Fatima",
          lastName: "Ali",
          subject: "Mathematics",
          qualification: "M.Sc Mathematics",
        },
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      
      // Grade actions
      {
        entity: "Grade",
        entityId: new mongoose.Types.ObjectId(),
        action: "create",
        user: teacherUser?._id,
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          subject: "Mathematics",
          marks: 85,
          totalMarks: 100,
          grade: "A",
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        entity: "Grade",
        entityId: new mongoose.Types.ObjectId(),
        action: "update",
        user: teacherUser?._id,
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          marks: { old: 82, new: 85 },
          grade: { old: "B", new: "A" },
        },
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      },
      
      // Attendance actions
      {
        entity: "Attendance",
        entityId: new mongoose.Types.ObjectId(),
        action: "create",
        user: teacherUser?._id,
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          date: new Date().toISOString(),
          status: "Present",
          class: "Grade 10 - A",
        },
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      
      // Fee Payment actions
      {
        entity: "FeePayment",
        entityId: new mongoose.Types.ObjectId(),
        action: "create",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          amount: 15000,
          paymentMethod: "Bank Transfer",
          status: "Paid",
          student: "Ahmed Khan",
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      
      // Class actions
      {
        entity: "Class",
        entityId: new mongoose.Types.ObjectId(),
        action: "update",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          capacity: { old: 30, new: 35 },
        },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      
      // Announcement actions
      {
        entity: "Announcement",
        entityId: new mongoose.Types.ObjectId(),
        action: "create",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          title: "School Reopening Date",
          priority: "high",
          targetAudience: "all",
        },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      
      // Login/Logout actions
      {
        entity: "User",
        entityId: adminUser?._id,
        action: "login",
        user: adminUser?._id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          loginTime: new Date().toISOString(),
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        entity: "User",
        entityId: teacherUser?._id,
        action: "login",
        user: teacherUser?._id,
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          loginTime: new Date().toISOString(),
        },
        timestamp: new Date(Date.now() - 75 * 60 * 1000), // 75 minutes ago
      },
      
      // Delete action
      {
        entity: "Assignment",
        entityId: new mongoose.Types.ObjectId(),
        action: "delete",
        user: teacherUser?._id,
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        changes: {
          title: "Deleted Assignment",
          subject: "Mathematics",
        },
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      },
    ];

    // Filter out logs without valid users
    const validAuditLogs = auditLogs.filter(log => log.user);

    if (validAuditLogs.length > 0) {
      await AuditLog.insertMany(validAuditLogs);
      console.log(`✅ Created ${validAuditLogs.length} audit logs`);
    } else {
      console.log("⚠️  No valid users found for audit logs. Please seed users first.");
    }
  } catch (error) {
    console.error("Error seeding audit logs:", error);
  }
};

const seedLogs = async () => {
  await connectDB();
  
  console.log("\n🌱 Seeding System and Audit Logs...\n");
  
  await seedSystemLogs();
  await seedAuditLogs();
  
  console.log("\n✅ Log seeding completed successfully!\n");
  
  mongoose.connection.close();
  process.exit(0);
};

// Run seeder
seedLogs();

