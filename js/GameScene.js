class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.players = [];
        this.gameOver = false;
    }

    create() {
        this.add.text(512, 30, '2-Player Tetris', {
            fontSize: '32px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const onGameOver = (loserId) => {
            if (this.gameOver) return;
            this.gameOver = true;
            this.players.forEach(p => p.interactionPaused = true);

            const winnerId = loserId === 1 ? 2 : 1;
            this.add.rectangle(512, 384, 600, 200, 0x000000, 0.8);
            this.add.text(512, 350, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
            this.add.text(512, 420, 'Player ' + winnerId + ' Wins!', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);
            this.add.text(512, 480, 'Refresh to Restart', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
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
