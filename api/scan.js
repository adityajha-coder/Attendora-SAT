export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { base64Image } = request.body;

        const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
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
                ]
            })
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('OpenRouter Failed:', errorText);
            return response.status(apiResponse.status).json({ error: errorText });
        }

        const data = await apiResponse.json();
        return response.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ error: error.message });
    }
}
