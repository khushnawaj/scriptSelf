require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the modern recommendation
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("SUCCESS:", (await result.response).text());
    } catch (e) {
        console.log("FULL_ERROR:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}
test();
