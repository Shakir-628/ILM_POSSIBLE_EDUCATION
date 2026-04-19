import aiService from "../services/aiService.js";

/**
 * @desc    Draft a communication message using AI
 * @route   POST /api/ai/draft-communication
 * @access  Private (Admins/Teachers)
 */
export const draftAICommunication = async (req, res) => {
    try {
        const { purpose, details } = req.body;

        if (!purpose) {
            return res.status(400).json({
                success: false,
                message: "Purpose of communication is required",
            });
        }

        const draft = await aiService.draftCommunication(purpose, details || "");

        res.status(200).json({
            success: true,
            data: draft,
        });
    } catch (error) {
        console.error("Draft AI Communication Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    draftAICommunication,
};
