import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const SCORES_FILE = path.join(__dirname, 'local-scores.json');

// Ensure scores file exists
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API Endpoints
    if (pathname === '/api/scores') {
        if (req.method === 'GET') {
            const scores = fs.readFileSync(SCORES_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(scores);
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const { player_name, score } = JSON.parse(body);
                    if (!player_name || score === undefined) {
                        throw new Error('Invalid data');
                    }

                    const scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
                    scores.push({ player_name, score, date: new Date().toISOString() });
                    scores.sort((a, b) => b.score - a.score);
                    const topScores = scores.slice(0, 50);

                    fs.writeFileSync(SCORES_FILE, JSON.stringify(topScores, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Score submitted' }));
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        }
    }

    // Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end(`Server error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Mock server running at http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/scores`);
});
