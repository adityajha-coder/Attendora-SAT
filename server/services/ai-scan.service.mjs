import config from '../config/index.mjs';

const SYSTEM_PROMPT = 'You are a precise data extraction specialist. Always return data as a single raw JSON array of objects. Never include markdown code blocks, explanatory text, or any characters outside the JSON structure.';

const USER_PROMPT = 'Extract the classes schedule from this Bhagwan Parshuram Institute of Technology (BPIT) timetable. RULES: 1. Extract EVERY SINGLE class for the entire day, from the earliest morning class to the absolute last evening class. DO NOT skip or omit any classes. 2. Map abbreviations (e.g., DS, OOPS, CM, DM, DLCD) to full names using the legend in the image provided (e.g., "Data Structure", "Computational Methods"). 3. Convert all PM times to 24-hour format (12:50-1:40 is 12:50-13:40). 4. If groups are mentioned like (G1) or (G2), include them in the name. 5. Ignore "LUNCH", "LIB", "PDP". Return ONLY a JSON array with this structure: [{"day": "Monday", "start": "09:30", "end": "10:20", "name": "Class Name", "instructor": "Instructor Name", "room": "407"}].';

export async function scanTimetableImage(base64Image) {
    const apiKey = config.openRouterApiKey;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured in environment');
    }

    let lastError = '';

    for (const model of config.openRouterModels) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://attendora-sat.vercel.app',
                    'X-Title': 'Attendora',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: USER_PROMPT },
                                { type: 'image_url', image_url: { url: base64Image } },
                            ],
                        },
                    ],
                    max_tokens: 4000,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[AIScan] ✓ Success with model: ${model}`);
                return data;
            }

            const errOutput = await response.text();
            console.error(`[AIScan] Model ${model} failed:`, errOutput);
            lastError = errOutput;

        } catch (err) {
            console.error(`[AIScan] Fetch error for ${model}:`, err.message);
            lastError = err.message;
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError}`);
}
