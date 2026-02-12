
const urls = [
    'http://localhost:5001/api/v1/folders',
    'http://localhost:5005/api/v1/folders',
    'http://localhost:5001/',
    'http://localhost:5005/'
];

async function check() {
    console.log("--- API Route Check ---");
    for (const url of urls) {
        try {
            // We expect 401 (Unauthorized) if route exists, or 404 if not found.
            const res = await fetch(url);
            console.log(`[${res.status}] ${url} - ${res.statusText}`);
        } catch (error) {
            // connection refused means server not on that port
            if (error.cause && error.cause.code === 'ECONNREFUSED') {
                console.log(`[OFF] ${url} - Connection Refused`);
            } else {
                console.log(`[ERR] ${url} - ${error.message}`);
            }
        }
    }
}

check();
