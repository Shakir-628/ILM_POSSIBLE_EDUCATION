import express from "express";
import {
  registerUser,
  registerSuperadmin,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { superadminOnly } from "../middleware/superadminMiddleware.js";
import encryptionService from "../services/encryptionService.js";

const router = express.Router();

// Create middleware wrapper for decryption
const decryptPassword = (req, res, next) => {
  encryptionService.decryptPasswordMiddleware(req, res, next);
};

// Apply decryption middleware to routes that receive passwords
router.post("/register", decryptPassword, registerUser);
router.post("/login", decryptPassword, loginUser);
router.post("/register-superadmin", protect, superadminOnly, decryptPassword, registerSuperadmin);
router.post("/forgot-password", forgotPassword); // No password in this route
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", decryptPassword, resetPassword);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/change-password", protect, decryptPassword, changePassword);

export default router;


