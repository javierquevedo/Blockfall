class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.players = [];
        this.gameOver = false;
    }

    create() {
        this.add.text(512, 30, 'Blockfall', {
            fontSize: '32px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const onGameOver = async (loserId) => {
            if (this.gameOver) return;
            this.gameOver = true;
            this.players.forEach(p => p.interactionPaused = true);

            const winnerId = loserId === 1 ? 2 : 1;
            const winner = this.players.find(p => p.playerId === winnerId);
            const winnerScore = winner ? winner.score : 0;

            const bg = this.add.rectangle(512, 384, 600, 450, 0x000000, 0.9);
            const title = this.add.text(512, 220, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
            const winnerText = this.add.text(512, 290, 'Player ' + winnerId + ' Wins!', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);
            const scoreText = this.add.text(512, 340, 'Score: ' + winnerScore, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

            const loadingText = this.add.text(512, 420, 'Loading Leaderboard...', { fontSize: '24px', fill: '#aaa' }).setOrigin(0.5);

            // 1. Submit Score (Simple window prompt for name)
            const playerName = prompt(`Player ${winnerId}, enter your name for the leaderboard:`) || `Player ${winnerId}`;

            try {
                // API endpoint for Vercel Blob
                await fetch('/api/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ player_name: playerName, score: winnerScore })
                });
            } catch (err) {
                console.warn('Leaderboard submit failed (expected locally)', err);
            }

            // 2. Fetch Leaderboard
            try {
                const res = await fetch('/api/scores');
                if (res.ok) {
                    const scores = await res.json();
                    loadingText.destroy();

                    this.add.text(512, 400, '--- TOP SCORES ---', { fontSize: '20px', fill: '#ffff00' }).setOrigin(0.5);

                    scores.slice(0, 5).forEach((entry, i) => {
                        this.add.text(512, 440 + (i * 30), `${i + 1}. ${entry.player_name}: ${entry.score}`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
                    });
                } else {
                    throw new Error('API Error');
                }
            } catch (err) {
                loadingText.setText('Leaderboard available on Vercel');
            }

            this.add.text(512, 650, 'Refresh to Restart', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        };

        // Player 1: WASD, Left Board
        this.players.push(new Player(this, 100, 100, this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D'
        }), 1, onGameOver));

        // Player 2: Arrows, Right Board
        this.players.push(new Player(this, 600, 100, this.input.keyboard.createCursorKeys(), 2, onGameOver));
    }

    update(time, delta) {
        if (this.gameOver) return;
        this.players.forEach(player => player.update(time));
    }
}
