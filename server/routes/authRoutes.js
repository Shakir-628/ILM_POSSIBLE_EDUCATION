import express from "express";
import {
  registerUser,
  registerSuperadmin,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { superadminOnly } from "../middleware/superadminMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// SuperAdmin-only route to register new superadmins
router.post("/register-superadmin", protect, superadminOnly, registerSuperadmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

export default router;

