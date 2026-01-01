import mongoose from "mongoose";

const ePortfolioSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["certificate", "sports", "project", "achievement", "community-service", "other"],
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        academicYear: {
            type: String,
            required: true,
        },
        attachments: [
            {
                filename: String,
                path: String,
                mimetype: String,
                fileSize: Number,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        tags: [String],
        achievementLevel: {
            type: String, // Gold, First Place, Distinction, etc.
            trim: true,
        },
        externalLinks: [
            {
                label: String,
                url: String,
            },
        ],
        isPublic: {
            type: Boolean,
            default: false, // Can be shared with parents or potential universities
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast lookup by student
ePortfolioSchema.index({ student: 1, category: 1 });
ePortfolioSchema.index({ academicYear: 1 });

const EPortfolio = mongoose.model("EPortfolio", ePortfolioSchema);

export default EPortfolio;
