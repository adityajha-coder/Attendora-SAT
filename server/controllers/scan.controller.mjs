import { scanTimetableImage } from '../services/ai-scan.service.mjs';
import { AppError } from '../middleware/error-handler.mjs';

export async function scanTimetable(req, res) {
    const { base64Image } = req.body;

    if (!base64Image) {
        throw new AppError('base64Image is required in request body', 400);
    }

    const data = await scanTimetableImage(base64Image);
    res.json(data);
}
