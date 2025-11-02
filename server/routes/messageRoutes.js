import express from "express";
import {
  getInbox,
  getSentMessages,
  getMessageById,
  sendMessage,
  deleteMessage,
  getUnreadCount,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router.get("/unread/count", protect, getUnreadCount);
router.get("/inbox", protect, getInbox);
router.get("/sent", protect, getSentMessages);
router.post("/", protect, auditLog("Message"), sendMessage);
router.get("/:id", protect, getMessageById);
router.delete("/:id", protect, auditLog("Message"), deleteMessage);

export default router;

