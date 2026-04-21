import express from "express";
import { 
  createOnlineClass, 
  getOnlineClasses, 
  updateClassStatus, 
  deleteOnlineClass 
} from "../controllers/onlineClassController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getOnlineClasses)
  .post(createOnlineClass);

router.route("/:id")
  .delete(deleteOnlineClass);

router.route("/:id/status")
  .patch(updateClassStatus);

export default router;
