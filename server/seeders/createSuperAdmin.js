import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });

    if (existingSuperAdmin) {
      console.log("SuperAdmin already exists!");
      console.log("Email:", existingSuperAdmin.email);
      process.exit(0);
    }

    // Create superadmin
    const superAdmin = await User.create({
      name: "Super Administrator",
      email: "superadmin@ilm.edu",
      password: "superadmin123", // Change this in production!
      role: "superadmin",
      phone: "0300-0000000",
      isActive: true,
    });

    console.log("✅ SuperAdmin created successfully!");
    console.log("Email:", superAdmin.email);
    console.log("Password: superadmin123");
    console.log("⚠️ Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating SuperAdmin:", error);
    process.exit(1);
  }
};

createSuperAdmin();

