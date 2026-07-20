// In development this falls back to your local Flask server.
// In production (Render), set REACT_APP_API_URL to your deployed backend's
// URL as a build-time environment variable, e.g.:
//   REACT_APP_API_URL=https://your-backend.onrender.com
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
