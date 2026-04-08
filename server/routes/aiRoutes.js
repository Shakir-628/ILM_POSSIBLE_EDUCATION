import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { draftAICommunication } from "../controllers/aiController.js";

const router = express.Router();

router.use(protect);

// Only admins and teachers can use general AI tools
router.post("/draft-communication", authorize('admin', 'teacher'), draftAICommunication);

export default router;
