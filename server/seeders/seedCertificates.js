import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

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

// Create sample certificates
const createCertificates = async () => {
  try {
    // Get a student and user (admin) from the database
    const students = await Student.find().limit(5);
    const admin = await User.findOne({ role: "admin" });

    if (students.length === 0) {
      console.log("❌ No students found. Please run the main seeder first: npm run seed");
      process.exit(1);
    }

    if (!admin) {
      console.log("❌ No admin user found. Please run the main seeder first: npm run seed");
      process.exit(1);
    }

    console.log(`Found ${students.length} students to create certificates for...`);

    // Delete existing certificates
    await Certificate.deleteMany();
    console.log("🗑️  Cleared existing certificates");

    // Sample certificates data
    const certificateTypes = [
      { type: "bonafide", title: "Bonafide Certificate" },
      { type: "character", title: "Character Certificate" },
      { type: "transfer", title: "Transfer Certificate" },
      { type: "achievement", title: "Achievement Certificate" },
      { type: "conduct", title: "Conduct Certificate" },
    ];

    const certificates = [];

    for (let i = 0; i < students.length && i < certificateTypes.length; i++) {
      const student = students[i];
      const certType = certificateTypes[i];

      const certificateData = {
        certificateNumber: "AUTO", // Will be auto-generated
        certificateType: certType.type,
        student: student._id,
        class: student.class,
        title: certType.title,
        content: `This is to certify that ${student.firstName} ${student.lastName}, student of class ${student.class ? 'assigned' : 'unassigned'}, has been a student of our institution. This certificate is issued upon request for official purposes.`,
        additionalDetails: {
          academicYear: new Date().getFullYear().toString(),
          conductRating: "good",
          remarks: "Student has shown excellent behavior and academic performance.",
        },
        template: null,
        signatures: {
          classTeacher: {
            name: "Mr. John Doe",
            designation: "Class Teacher",
          },
          principal: {
            name: "Dr. Jane Smith",
            designation: "Principal",
          },
        },
        issueDate: new Date(),
        status: i % 3 === 0 ? "draft" : "issued", // Mix of draft and issued
        issuedBy: admin._id,
      };

      certificates.push(certificateData);
    }

    // Create certificates one by one to allow pre-save hook to generate unique numbers
    const createdCertificates = [];
    for (const certData of certificates) {
      const cert = new Certificate(certData);
      await cert.save();
      createdCertificates.push(cert);
    }

    console.log(`✅ Created ${createdCertificates.length} certificates`);
    console.log("\n📋 Certificate Summary:");
    createdCertificates.forEach((cert) => {
      console.log(`   - ${cert.certificateNumber}: ${cert.title} (${cert.status})`);
    });

    console.log("\n🎉 Certificate seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await createCertificates();
};

runSeeder();

