import express from "express";
import {
    getStudentPortfolio,
    addPortfolioItem,
    uploadAttachments,
    updatePortfolioItem,
    deletePortfolioItem
} from "../controllers/ePortfolioController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { upload } from "../services/fileService.js";

const router = express.Router();

// Middleware to set upload directory
const setUploadType = (type) => (req, res, next) => {
    req.uploadType = type;
    next();
};

router.get("/student/:studentId", protect, getStudentPortfolio);

router.post(
    "/",
    protect,
    authorize("admin", "teacher"),
    addPortfolioItem
);

router.post(
    "/:id/attachments",
    protect,
    setUploadType("portfolio"),
    upload.array("attachments", 5),
    uploadAttachments
);

router
    .route("/:id")
    .put(protect, updatePortfolioItem)
    .delete(protect, deletePortfolioItem);

export default router;
