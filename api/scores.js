import { put, list, head } from '@vercel/blob';

const SCORES_FILE = process.env.SCORES_FILENAME || 'scores.json';

// Helper to check for required environment variables
function verifyConfig() {
    const token = process.env.blockfall_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        throw new Error('MISSING_TOKEN: Neither blockfall_READ_WRITE_TOKEN nor BLOB_READ_WRITE_TOKEN is configured in Vercel Environment Variables.');
    }
    // The Vercel Blob SDK specifically looks for BLOB_READ_WRITE_TOKEN.
    // So we assign the custom token to the expected variable if needed.
    if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.blockfall_READ_WRITE_TOKEN) {
        process.env.BLOB_READ_WRITE_TOKEN = process.env.blockfall_READ_WRITE_TOKEN;
    }
}

// Helper to get current scores
async function getScores() {
    try {
        verifyConfig();
        const { blobs } = await list();
        const scoreBlob = blobs.find(b => b.pathname === SCORES_FILE);

        if (scoreBlob) {
            const response = await fetch(scoreBlob.url);
            if (response.ok) {
                return await response.json();
            }
        }
        return []; // Default if no file
    } catch (error) {
        console.error('Error fetching scores:', error.message);
        throw error; // Re-throw to handle in main handler
    }
}

export default async function handler(request, response) {
    try {
        verifyConfig();
    } catch (error) {
        console.error('Configuration Error:', error.message);
        return response.status(500).json({
            error: 'Configuration Error',
            details: error.message,
            tip: 'Ensure BLOB_READ_WRITE_TOKEN is set in your Vercel Project Settings.'
        });
    }

    if (request.method === 'GET') {
        try {
            const scores = await getScores();
            return response.status(200).json(scores);
        } catch (error) {
            return response.status(500).json({ error: 'Failed to fetch scores', details: error.message });
        }
    }

    if (request.method === 'POST') {
        try {
            const { player_name, score } = request.body;
            if (!player_name || score === undefined) throw new Error('Player name and score required');

            // 1. Get existing scores
            const currentScores = await getScores();

            // 2. Add new score
            currentScores.push({ player_name, score, date: new Date().toISOString() });

            // 3. Sort and limit (Top 50 to keep file size small)
            currentScores.sort((a, b) => b.score - a.score);
            const topScores = currentScores.slice(0, 50);

            // 4. Overwrite file in Blob store
            await put(SCORES_FILE, JSON.stringify(topScores), {
                access: 'public',
                addRandomSuffix: false // Overwrite same file
            });

            return response.status(200).json({ message: 'Score submitted' });
        } catch (error) {
            return response.status(500).json({ error: error.message });
        }
    }

    return response.status(405).json({ message: 'Method Not Allowed' });
}
