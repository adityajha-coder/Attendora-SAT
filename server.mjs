import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                const groqApiKey = process.env.GROQ_API_KEY;

                if (!groqApiKey) {
                     res.writeHead(500, { 'Content-Type': 'application/json' });
                     return res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured in .env' }));
                }

                const modelsToTry = [
                    'llama-3.2-90b-vision-preview',
                    'llama-3.2-11b-vision-preview',
                    'llama-3.2-11b-vision-instruct',
                    'llama3-vision-preview'
                ];

                let apiResponse = null;
                let lastError = '';

                for (const model of modelsToTry) {
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${groqApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            type: 'text',
                                            text: 'You are a highly accurate data extraction AI. Extract the classes schedule from this timetable image grid. There is a vertical column spanning all days that says "LUNCH". You MUST extract all classes that occur to the left AND to the right of the LUNCH column. CRITICAL RULE: Map the abbreviated subjects to their full faculty/instructor names and full subject names using the legend at the bottom of the image. For example, if the grid says "CM", look up "CM" in the legend to find "Computational Methods (CM)" and the corresponding instructor name. If a class is split into groups (e.g. G1/G2), extract them separately with the group name in parenthesis. Return ONLY a valid JSON array of objects without any markdown formatting, backticks, or extra text. Use this exact structure: {"day": "Monday", "start": "09:30", "end": "10:20", "name": "Class Name", "instructor": "Instructor Name", "room": "Room Number"}. Map abbreviations to full day names. Convert ALL PM times strictly to 24-hour HH:MM format (e.g., 1:40 is 13:40, 2:30 is 14:30). If a class spans multiple periods, adjust the start and end time accordingly. Exclude "LUNCH", "BREAK", "LIB", "PDP", or empty cells. Do not skip any valid classes. Return [] if no classes are found.'
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
                }

                if (!apiResponse) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: `Groq Error for all models. Last Error: ${lastError}` }));
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
    const absolutePath = path.join(__dirname, filePath);

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
