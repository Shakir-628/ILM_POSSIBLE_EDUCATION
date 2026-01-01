import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotifications,
  refreshAdminNotificationsHandler,
  getAdminNotificationSummary,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/unread/count", protect, getUnreadCount);
router.put("/read-all", protect, markAllAsRead);
router.get("/admin/summary", protect, authorize("admin"), getAdminNotificationSummary);
router.post("/admin/refresh", protect, authorize("admin"), refreshAdminNotificationsHandler);
router.get("/", protect, getNotifications);
router.post("/", protect, authorize("admin"), createNotification);
router.post("/bulk", protect, authorize("admin"), createBulkNotifications);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

export default router;

