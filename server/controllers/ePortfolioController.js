import EPortfolio from "../models/EPortfolio.js";
import Student from "../models/Student.js";
import path from "path";
import fs from "fs";

// @desc    Get all portfolio items for a student
// @route   GET /api/e-portfolio/student/:studentId
// @access  Private
export const getStudentPortfolio = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const portfolioItems = await EPortfolio.find({ student: studentId })
            .populate("addedBy", "name")
            .sort({ date: -1 });

        res.json(portfolioItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a portfolio item
// @route   POST /api/e-portfolio
// @access  Private (Admin, Teacher)
export const addPortfolioItem = async (req, res) => {
    try {
        const {
            studentId,
            title,
            category,
            description,
            date,
            academicYear,
            tags,
            achievementLevel,
            externalLinks,
        } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const item = await EPortfolio.create({
            student: studentId,
            title,
            category,
            description,
            date,
            academicYear,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
            achievementLevel,
            externalLinks: externalLinks ? (typeof externalLinks === 'string' ? JSON.parse(externalLinks) : externalLinks) : [],
            addedBy: req.user._id,
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload attachments to a portfolio item
// @route   POST /api/e-portfolio/:id/attachments
// @access  Private
export const uploadAttachments = async (req, res) => {
    try {
        const item = await EPortfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const attachments = req.files.map(file => ({
            filename: file.filename,
            path: `/uploads/portfolio/${file.filename}`,
            mimetype: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
        }));

        item.attachments.push(...attachments);
        await item.save();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a portfolio item
// @route   PUT /api/e-portfolio/:id
// @access  Private
export const updatePortfolioItem = async (req, res) => {
    try {
        const item = await EPortfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        Object.assign(item, req.body);
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a portfolio item
// @route   DELETE /api/e-portfolio/:id
// @access  Private
export const deletePortfolioItem = async (req, res) => {
    try {
        const item = await EPortfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Portfolio item not found" });
        }

        // Delete associated files
        item.attachments.forEach(attachment => {
            const filePath = path.join(process.cwd(), attachment.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await item.deleteOne();
        res.json({ message: "Portfolio item removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
