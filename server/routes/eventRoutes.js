import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getUpcomingEvents,
  getEventStats,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";
import { upload } from "../services/fileService.js";

const router = express.Router();

// Stats and upcoming
router.get("/stats", protect, getEventStats);
router.get("/upcoming", protect, getUpcomingEvents);

// Registration routes
router.post("/:id/register", protect, registerForEvent);
router.post("/:id/unregister", protect, unregisterFromEvent);

router
  .route("/")
  .get(protect, getAllEvents)
  .post(
    protect,
    authorize("admin"),
    upload.array("files", 5),
    auditLog("Event"),
    createEvent
  );

router
  .route("/:id")
  .get(protect, getEventById)
  .put(
    protect,
    authorize("admin"),
    upload.array("files", 5),
    auditLog("Event"),
    updateEvent
  )
  .delete(protect, authorize("admin"), auditLog("Event"), deleteEvent);

export default router;

