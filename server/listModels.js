require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        // The SDK doesn't have a direct listModels on the genAI object in some versions, 
        // but we can try to fetch it via the base URL or just try a few common names.
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("hi");
                console.log(`MODEL ${modelName}: SUCCESS`);
                return;
            } catch (e) {
                console.log(`MODEL ${modelName}: FAILED - ${e.message}`);
            }
        }
    } catch (error) {
        console.log("BASE ERROR:", error.message);
    }
}
listModels();
