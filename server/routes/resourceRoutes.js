import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
} from "../controllers/resourceController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resources/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx|txt|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only documents and images are allowed"));
    }
  },
});

router.use(protect);

router
  .route("/")
  .get(getResources)
  .post(authorize("admin", "teacher"), upload.single("file"), createResource);

router
  .route("/:id")
  .put(authorize("admin", "teacher"), upload.single("file"), updateResource)
  .delete(authorize("admin", "teacher"), deleteResource);

router.get("/download/:id", downloadResource);

export default router;
