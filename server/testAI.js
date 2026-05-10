require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("Testing Gemini API with Key:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("AI Response:", response.text());
    } catch (error) {
        console.error("AI Error Details:", error);
    }
}

test();
