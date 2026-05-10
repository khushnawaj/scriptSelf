require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using a model that we KNOW is in the list
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("hello");
        console.log("SUCCESS:", (await result.response).text());
    } catch (e) {
        console.log("ERR:", e.message);
    }
}
test();
