import axios from "axios";

/**
 * Generate a personalized congratulatory note for a student
 * @param {Object} studentData - Data about the student
 * @param {string} topSubject - Their best performing subject
 * @returns {string} - The personalized note
 */
export const generateCongratulatoryNote = async (studentData, topSubject) => {
    try {
        const prompt = `Write a short, professional, and encouraging congratulatory note (2-3 sentences) for a student named ${studentData.firstName} ${studentData.lastName} who just completed their final exams. Their top performing subject was ${topSubject}. The note should be addressed to the parents.`;

        // If you have an AI API key (like Gemini or OpenAI), you can call it here:
        /*
        const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        return response.data.candidates[0].content.parts[0].text;
        */

        // Fallback: Smart template-based generation if no API key is available
        const templates = [
            `We are incredibly proud of ${studentData.firstName}'s hard work this term. Their exceptional performance in ${topSubject} is a testament to their dedication and potential.`,
            `Congratulations to ${studentData.firstName} on successfully completing the final exams! We were particularly impressed by their mastery of ${topSubject}, which was their strongest subject.`,
            `${studentData.firstName} has shown remarkable growth this year. Their top-tier results in ${topSubject} highlight their commitment to academic excellence.`,
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    } catch (error) {
        console.error("AI Generation Error:", error);
        return `Congratulations to ${studentData.firstName} on completing their final exams. Great job in ${topSubject}!`;
    }
};

export default {
    generateCongratulatoryNote,
};
