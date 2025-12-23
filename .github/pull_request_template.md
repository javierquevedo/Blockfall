# Description

This PR implements a persistent leaderboard system for Blockfall using Vercel Serverless Functions and Vercel Blob storage.

## Key Changes
*   **Backend (`api/scores.js`)**: Created a serverless API endpoint to `GET` and `POST` scores.
    *   Switched from `@vercel/postgres` to `@vercel/blob` for simple JSON-based storage.
    *   Reads/Writes to a `scores.json` file in the Blob store.
    *   `SCORES_FILENAME` is configurable via environment variables (defaults to `scores.json`).
*   **Frontend (`js/GameScene.js`)**: Updated the "Game Over" sequence.
    *   Prompts the winner for their name.
    *   Submits the score to the API.
    *   Fetches and displays the Top 5 scores immediately.
*   **Dependencies**: Added `@vercel/blob`, removed `@vercel/postgres`.

## Configuration
1.  Connect a **Vercel Blob** store to the project in the Vercel Dashboard.
2.  (Optional) Set `SCORES_FILENAME` env var to customize the storage file name.

## Testing
*   Play a game to completion.
*   Enter a name when prompted.
*   Verify the score appears in the "Top Scores" list.

## Closes
Feature/Leaderboard implementation.
