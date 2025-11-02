import express from "express";
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAllAnnouncements)
  .post(protect, authorize("admin"), auditLog("Announcement"), createAnnouncement);

router
  .route("/:id")
  .get(protect, getAnnouncementById)
  .put(protect, authorize("admin"), auditLog("Announcement"), updateAnnouncement)
  .delete(protect, authorize("admin"), auditLog("Announcement"), deleteAnnouncement);

export default router;
