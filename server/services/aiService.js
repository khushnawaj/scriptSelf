const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes code/content for optimization
 */
exports.analyzeCode = async (content, codeSnippet = "") => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
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
