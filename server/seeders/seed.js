import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";

// Import seed data
import { users } from "./data/users.js";
import { subjects } from "./data/subjects.js";
import { classes } from "./data/classes.js";
import { teachers } from "./data/teachers.js";
import { students } from "./data/students.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Class.deleteMany();
    await Subject.deleteMany();
    console.log("🗑️  Data cleared");
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  }
};

// Import data
const importData = async () => {
  try {
    // 1. Create Users first
    console.log("👤 Creating users...");
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Map users by role for reference
    const adminUsers = createdUsers.filter((u) => u.role === "admin");
    const teacherUsers = createdUsers.filter((u) => u.role === "teacher");
    const studentUsers = createdUsers.filter((u) => u.role === "student");

    // 2. Create Subjects
    console.log("📚 Creating subjects...");
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Created ${createdSubjects.length} subjects`);

    // 3. Create Teachers (link to teacher users)
    console.log("👨‍🏫 Creating teachers...");
    const teachersWithUsers = teachers.map((teacher, index) => ({
      ...teacher,
      user: teacherUsers[index]?._id || teacherUsers[0]._id,
      subjects: [createdSubjects[index % createdSubjects.length]._id],
    }));
    const createdTeachers = await Teacher.insertMany(teachersWithUsers);
    console.log(`✅ Created ${createdTeachers.length} teachers`);

    // 4. Create Classes (link to teachers and subjects)
    console.log("🏫 Creating classes...");
    const classesWithReferences = classes.map((cls, index) => ({
      ...cls,
      teacher: createdTeachers[index % createdTeachers.length]._id,
      subjects: [
        createdSubjects[index % createdSubjects.length]._id,
        createdSubjects[(index + 1) % createdSubjects.length]._id,
      ],
    }));
    const createdClasses = await Class.insertMany(classesWithReferences);
    console.log(`✅ Created ${createdClasses.length} classes`);

    // 5. Create Students (link to student users and classes)
    console.log("👨‍🎓 Creating students...");
    const studentsWithReferences = students.map((student, index) => ({
      ...student,
      user: studentUsers[index]?._id || studentUsers[0]._id,
      class: createdClasses[index % createdClasses.length]._id,
    }));
    const createdStudents = await Student.insertMany(studentsWithReferences);
    console.log(`✅ Created ${createdStudents.length} students`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   - Admins: ${adminUsers.length}`);
    console.log(`   - Teachers: ${teacherUsers.length}`);
    console.log(`   - Students: ${studentUsers.length}`);
    console.log(`   Subjects: ${createdSubjects.length}`);
    console.log(`   Teachers: ${createdTeachers.length}`);
    console.log(`   Classes: ${createdClasses.length}`);
    console.log(`   Students: ${createdStudents.length}`);

    console.log("\n🔐 Test Credentials:");
    console.log("\n   Admin:");
    console.log("   Email: admin@ilmpossible.com");
    console.log("   Password: admin123");
    console.log("\n   Teacher:");
    console.log("   Email: teacher1@ilmpossible.com");
    console.log("   Password: teacher123");
    console.log("\n   Student:");
    console.log("   Email: student1@ilmpossible.com");
    console.log("   Password: student123");

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    await clearData();
    console.log("✅ Data destroyed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();

  if (process.argv[2] === "-d") {
    await destroyData();
  } else {
    await clearData();
    await importData();
  }
};

runSeeder();

