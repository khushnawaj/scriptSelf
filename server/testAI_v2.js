require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (error) {
        console.log("ERROR_MESSAGE:", error.message);
        if (error.response) {
            console.log("ERROR_DETAILS:", JSON.stringify(error.response, null, 2));
        }
    }
}
test();
