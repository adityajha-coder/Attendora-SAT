import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

let PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer(async (req, res) => {
    // Handle API route
    if (req.method === 'POST' && req.url === '/api/scan') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const { base64Image } = JSON.parse(body);
                const openRouterApiKey = process.env.OPENROUTER_API_KEY;

                if (!openRouterApiKey) {
                     res.writeHead(500, { 'Content-Type': 'application/json' });
                     return res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured in .env' }));
                }

                const modelsToTry = [
                    'openai/gpt-4o-mini',
                    'meta-llama/llama-3.2-90b-vision-instruct',
                    'meta-llama/llama-3.2-11b-vision-instruct',
                    'google/gemini-flash-1.5'
                ];
                console.log("Testing corrected OpenRouter model paths:", modelsToTry);

                let apiResponse = null;
                let lastError = '';

                for (const model of modelsToTry) {
                    try {
                        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${openRouterApiKey}`,
                                'Content-Type': 'application/json',
                                'HTTP-Referer': 'http://localhost:3000',
                                'X-Title': 'Attendora'
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: [
                                    {
                                        role: 'system',
                                        content: 'You are a precise data extraction specialist. Always return data as a single raw JSON array of objects. Never include markdown code blocks, explanatory text, or any characters outside the JSON structure.'
                                    },
                                    {
                                        role: 'user',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'Extract the classes schedule from this Bhagwan Parshuram Institute of Technology (BPIT) timetable. RULES: 1. Extract all classes (9:30 AM to 5:00 PM). 2. Map abbreviations (e.g., DS, OOPS, CM, DM, DLCD) to full names using the legend in the image provided (e.g., "Data Structure", "Computational Methods"). 3. Convert all PM times to 24-hour format (12:50-1:40 is 12:50-13:40). 4. If groups are mentioned like (G1) or (G2), include them in the name. 5. Ignore "LUNCH", "LIB", "PDP". Return ONLY a JSON array with this structure: [{"day": "Monday", "start": "09:30", "end": "10:20", "name": "Class Name", "instructor": "Instructor Name", "room": "407"}].'
                                            },
                                            {
                                                type: 'image_url',
                                                image_url: {
                                                    url: base64Image
                                                }
                                            }
                                        ]
                                    }
                                ],
                                max_tokens: 1500
                            })
                        });

                        if (response.ok) {
                            apiResponse = response;
                            break;
                        } else {
                            const errOutput = await response.text();
                            console.error(`Model ${model} failed:`, errOutput);
                            lastError = errOutput;
                        }
                    } catch (e) {
                        console.error(`Fetch error for ${model}:`, e.message);
                        lastError = e.message;
                    }
                }

                if (!apiResponse) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: `OpenRouter Error for all models. Last Error: ${lastError}` }));
                }

                const data = await apiResponse.json();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
                
            } catch (err) {
                console.error("API Error: ", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Static file serving fallback
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Strip query strings
    filePath = filePath.split('?')[0];

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    const absolutePath = path.join(__dirname, '..', filePath);

    fs.readFile(absolutePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`File not found: ${filePath}`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});



function startServer(port) {
    server.listen(port, () => {
        console.log(`Server running with API Backend on http://localhost:${port}`);
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is in use, trying next port...`);
        PORT++;
        startServer(PORT);
    } else {
        console.error("Server initialization error:", err);
    }
});

startServer(PORT);
