import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    try {
        const result = await sql`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(50),
        score INT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
        return response.status(200).json({ result });
    } catch (error) {
        return response.status(500).json({ error });
    }
}
