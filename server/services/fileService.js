import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, "../uploads");
const documentsDir = path.join(uploadsDir, "documents");
const assignmentsDir = path.join(uploadsDir, "assignments");
const qrcodesDir = path.join(uploadsDir, "qrcodes");
const portfolioDir = path.join(uploadsDir, "portfolio");

[uploadsDir, documentsDir, assignmentsDir, qrcodesDir, portfolioDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadType = "general";

    // Determine upload type from request
    if (req.uploadType) {
      uploadType = req.uploadType;
    } else if (req.originalUrl.includes("/documents")) {
      uploadType = "documents";
    } else if (req.originalUrl.includes("/assignments")) {
      uploadType = "assignments";
    }

    const dest = path.join(uploadsDir, uploadType);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, uniqueSuffix + "-" + sanitizedFilename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images, documents, and archives are allowed!"));
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: fileFilter,
});

// Delete file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Get file URL
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  return `/uploads/${filePath.replace(/\\/g, "/")}`;
};

// Process uploaded files for response
export const processUploadedFiles = (files) => {
  if (!files) return [];

  const fileArray = Array.isArray(files) ? files : [files];

  return fileArray.map((file) => ({
    filename: file.originalname,
    path: file.path.replace(/\\/g, "/").split("/uploads/")[1],
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  }));
};

export default {
  upload,
  deleteFile,
  getFileUrl,
  processUploadedFiles,
};
