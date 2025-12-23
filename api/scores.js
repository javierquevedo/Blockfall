import { put, list, head } from '@vercel/blob';

const SCORES_FILE = 'scores.json';

// Helper to get current scores
async function getScores() {
    try {
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
        console.error('Error fetching scores:', error);
        return [];
    }
}

export default async function handler(request, response) {
    if (request.method === 'GET') {
        const scores = await getScores();
        return response.status(200).json(scores);
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
