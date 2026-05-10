const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const key = "AIzaSyAkmqqud2GGNE2TW8ff1sqIfsm1_9ormW8";
        const genAI = new GoogleGenerativeAI(key);
        // Try Gemini 1.0 Pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("hello");
        console.log("SUCCESS:", (await result.response).text());
    } catch (e) {
        console.log("ERR:", e.message);
    }
}
test();
