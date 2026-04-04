module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { base64Image } = request.body;
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            console.error("Missing Groq API Key configured in Vercel.");
            return response.status(500).json({ error: "Missing API Key configuration." });
        }

        const modelsToTry = [
            'llama-3.2-90b-vision-preview',
            'llama-3.2-11b-vision-preview'
        ];

        let apiResponse = null;
        let lastError = '';

        for (const model of modelsToTry) {
            try {
                const responseFromApi = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqApiKey}`,
                        'Content-Type': 'application/json'
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
                                        text: 'Extract the classes schedule from this timetable image grid. There is a vertical column spanning all days that says "LUNCH". You MUST extract all classes that occur to the left AND to the right of the LUNCH column. CRITICAL RULE: Map the abbreviated subjects to their full faculty/instructor names and full subject names using the legend at the bottom of the image. For example, if the grid says "CM", look up "CM" in the legend to find "Computational Methods (CM)" and the corresponding instructor name. If a class is split into groups (e.g. G1/G2), extract them separately with the group name in parenthesis. Return ONLY a valid JSON array of objects without any markdown formatting, backticks, or extra text. Use this exact structure: {"day": "Monday", "start": "09:30", "end": "10:20", "name": "Class Name", "instructor": "Instructor Name", "room": "Room Number"}. Map abbreviations to full day names. Convert ALL PM times strictly to 24-hour HH:MM format (e.g., 1:40 is 13:40, 2:30 is 14:30). If a class spans multiple periods, adjust the start and end time accordingly. Exclude "LUNCH", "BREAK", "LIB", "PDP", or empty cells. Do not skip any valid classes. Return [] if no classes are found.'
                                    },
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: base64Image
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (responseFromApi.ok) {
                    apiResponse = responseFromApi;
                    break;
                } else {
                    const errOutput = await responseFromApi.text();
                    console.error(`Model ${model} failed:`, errOutput);
                    lastError = errOutput;
                }
            } catch (e) {
                console.error(`Fetch error for ${model}:`, e.message);
                lastError = e.message;
            }
        }

        if (!apiResponse) {
            return response.status(400).json({ error: `Groq Error for all AI models. Last Error: ${lastError}` });
        }

        const data = await apiResponse.json();
        return response.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ error: error.message });
    }
};
