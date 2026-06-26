import { env } from './env';

// List of origins allowed to access the API and WebSocket server
export const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://campusverse-client.onrender.com', // Hardcoded Render frontend
  process.env.CLIENT_URL,                    // Dynamic override via env variable
].filter((v): v is string => Boolean(v));
