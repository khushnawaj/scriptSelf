const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes code/content and returns structured metadata
 */
exports.analyzeCode = async (content, codeSnippet = "") => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // Using the latest 2.0 Flash model
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
        let text = response.text();

        console.log("Gemini Raw Response:", text);

        // More robust cleaning
        text = text.replace(/```json/gi, "")
            .replace(/```/g, "")
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
            .trim();

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON:", parseError);
            console.error("Cleaned Text:", text);
            return { error: "AI returned an invalid response format. Please try again." };
        }
    } catch (error) {
        console.error("Gemini AI Analysis Error:", error.message);

        if (error.message.includes("403") || error.message.includes("API_KEY_INVALID")) {
            console.error("CRITICAL: AI API Key invalid or API not enabled.");
            return { error: "AI Service authentication failed. Please check GEMINI_API_KEY." };
        }

        if (error.message.includes("404") || error.message.includes("not found")) {
            console.error("CRITICAL: Gemini model not found. Check if the model name is correct for your region/project.");
            return { error: "AI Model not found. This usually means the API key doesn't have access to this model version." };
        }

        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("overloaded")) {
            console.error("AI Service is busy or quota exceeded.");
            return { error: "AI Service is temporarily busy or your free quota is exceeded. Please wait a few seconds and try again." };
        }

        if (error.response) {
            console.error("Gemini Error Response Details:", error.response);
        }
        return { error: "An unexpected AI error occurred: " + error.message };
    }
};
