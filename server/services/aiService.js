const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes code/content for optimization
 */
exports.analyzeCode = async (content, codeSnippet = "") => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are the ScriptShelf AI engine. Analyze input and return STRICT JSON. Schema: { \"title\": string, \"tags\": string[], \"complexity\": string, \"explanation\": string, \"refactoredCode\": string }"
        });

        const prompt = `
            Analyze the following note content and optional code snippet.
            Provide a professional title, relevant technical tags, complexity level (Easy, Medium, Hard), 
            a brief explanation of what the code/note does, and a refactored/optimized version of the code.

            Content: ${content}
            Code Snippet: ${codeSnippet}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return cleanAndParseJSON(response.text());
    } catch (error) {
        return handleAIError(error);
    }
};


/**
 * Generates a quiz based on note content
 */
exports.generateQuiz = async (content) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are the ScriptShelf Study Engine. Generate a technical quiz based on provided content. Return STRICT JSON. Schema: { \"questions\": [ { \"question\": string, \"options\": [string, string, string, string], \"correctIndex\": number, \"explanation\": string } ] }"
        });

        const prompt = `
            Based on the following technical documentation, generate 3 multiple-choice questions to test the user's understanding.
            Ensure the questions are challenging but fair.
            
            Documentation: ${content}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return cleanAndParseJSON(response.text());
    } catch (error) {
        return handleAIError(error);
    }
};

/**
 * Generates interview prep questions and summaries
 */
exports.generateInterviewPrep = async (content) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are the ScriptShelf Interview Coach. Distill the provided documentation into key talking points, potential interview questions, and concise answers. Return STRICT JSON. Schema: { \"talkingPoints\": string[], \"questions\": [ { \"q\": string, \"a\": string } ] }"
        });

        const prompt = `
            Analyze this technical note and prepare it for an interview candidate.
            Focus on practical application and common pitfalls.
            
            Content: ${content}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return cleanAndParseJSON(response.text());
    } catch (error) {
        return handleAIError(error);
    }
};

// Helper to clean and parse JSON from Gemini
const cleanAndParseJSON = (text) => {

    console.log("Gemini Raw Response:", text);
    const cleaned = text.replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return { error: "Invalid AI response format." };
    }
};

// Helper for error handling
const handleAIError = (error) => {
    console.error("AI Error:", error.message);
    if (error.message.includes("429")) return { error: "AI quota exceeded. Try again in 60s." };
    if (error.message.includes("API_KEY")) return { error: "AI Configuration Error." };
    return { error: error.message };
};

