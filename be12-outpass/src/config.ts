// backend/src/config.ts
import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const API_BASE_URL = process.env.VIT_API_URL || `http://localhost:${PORT}/api`;
