
import app from './server.js';

const PORT = process.env.PORT || 5000;

// Only start the server locally - Vercel handles the serverless function via server.js export
if (process.env.VERCEL !== 'true') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
