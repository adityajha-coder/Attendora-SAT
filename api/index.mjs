import app from '../server/app.mjs';
import { connectDatabase } from '../server/db/connection.mjs';

// Connect DB for serverless (Vercel) environment
connectDatabase();

export default app;
