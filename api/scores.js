import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    if (request.method === 'GET') {
        // Fetch top 10 scores
        try {
            const { rows } = await sql`SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 10;`;
            return response.status(200).json(rows);
        } catch (error) {
            return response.status(500).json({ error: error.message });
        }
    } else if (request.method === 'POST') {
        // Submit a new score
        try {
            const { player_name, score } = request.body;
            if (!player_name || score === undefined) throw new Error('Player name and score required');

            await sql`INSERT INTO scores (player_name, score) VALUES (${player_name}, ${score});`;
            return response.status(200).json({ message: 'Score submitted' });
        } catch (error) {
            return response.status(500).json({ error: error.message });
        }
    } else {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }
}
