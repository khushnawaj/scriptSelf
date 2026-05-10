const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const key = "AIzaSyAkmqqud2GGNE2TW8ff1sqIfsm1_9ormW8"; // Pasted from user's .env
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("SUCCESS:", (await result.response).text());
    } catch (e) {
        console.log("ERR:", e.message);
    }
}
test();
