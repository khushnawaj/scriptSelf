const https = require('https');

const key = "AIzaSyAkmqqud2GGNE2TW8ff1sqIfsm1_9ormW8";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log("STATUS:", res.statusCode);
        console.log("DATA:", data);
    });
}).on('error', (err) => {
    console.log("ERR:", err.message);
});
