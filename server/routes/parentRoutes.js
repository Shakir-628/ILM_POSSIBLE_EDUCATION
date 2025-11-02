import express from "express";
import {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  linkChild,
  unlinkChild,
} from "../controllers/parentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin"), getParents)
  .post(protect, authorize("admin"), auditLog("Parent"), createParent);

router.post(
  "/:id/link-child",
  protect,
  authorize("admin"),
  auditLog("Parent"),
  linkChild
);

router.post(
  "/:id/unlink-child",
  protect,
  authorize("admin"),
  auditLog("Parent"),
  unlinkChild
);

router
  .route("/:id")
  .get(protect, authorize("admin"), getParentById)
  .put(protect, authorize("admin"), auditLog("Parent"), updateParent)
  .delete(protect, authorize("admin"), auditLog("Parent"), deleteParent);

export default router;

