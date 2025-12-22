class Player {
    constructor(scene, boardX, boardY, controls, playerId, onGameOver) {
        this.scene = scene;
        this.interactionPaused = false;
        this.playerId = playerId;
        this.onGameOver = onGameOver;
        this.board = new Board(scene, boardX, boardY);
        this.controls = controls;
        this.score = 0;
        this.nextDropTime = this.scene.time.now + 1000;
        this.dropInterval = 1000;

        // Piece Queue
        this.nextPiece = this.getRandomPiece();
        this.spawnNextPiece();

        // Input handling flags
        this.lastMoveTime = 0;
        this.moveInterval = 100;

        // UI
        this.scoreText = this.scene.add.text(boardX, boardY - 30, 'P' + playerId + ' Score: 0', { fontSize: '20px', fill: '#fff' });
        this.nextPieceLabel = this.scene.add.text(boardX + BOARD_WIDTH * BLOCK_SIZE + 10, boardY, 'Next:', { fontSize: '16px', fill: '#aaa' });
        this.nextPieceGraphics = this.scene.add.graphics();
    }

    getRandomPiece() {
        const keys = Object.keys(TETROMINOS);
        return TETROMINOS[keys[Math.floor(Math.random() * keys.length)]];
    }

    spawnNextPiece() {
        if (!this.board.spawn(this.nextPiece)) {
            this.interactionPaused = true;
            if (this.onGameOver) this.onGameOver(this.playerId);
        }
        this.nextPiece = this.getRandomPiece();
    }

    update(time) {
        if (this.interactionPaused || this.board.isClearing) return;

        if (!this.board.activePiece) return;

        // Gravity
        if (time > this.nextDropTime) {
            if (!this.board.move(0, 1)) {
                this.board.lock((linesCleared) => {
                    if (linesCleared > 0) {
                        this.score += linesCleared * 100;
                        this.scoreText.setText('P' + this.playerId + ' Score: ' + this.score);
                    }
                    this.spawnNextPiece();
                });
            }
            this.nextDropTime = time + this.dropInterval;
        }

        // Controls
        if (time > this.lastMoveTime) {
            if (this.controls.left.isDown) {
                this.board.move(-1, 0);
                this.lastMoveTime = time + this.moveInterval;
            } else if (this.controls.right.isDown) {
                this.board.move(1, 0);
                this.lastMoveTime = time + this.moveInterval;
            } else if (this.controls.down.isDown) {
                if (this.board.move(0, 1)) {
                    this.nextDropTime = time + this.dropInterval;
                    this.score += 1;
                    this.scoreText.setText('P' + this.playerId + ' Score: ' + this.score);
                }
                this.lastMoveTime = time + 50;
            } else if (Phaser.Input.Keyboard.JustDown(this.controls.up)) {
                this.board.rotate();
            }
        }

        this.board.render();
        this.renderNextPiece();
    }

    renderNextPiece() {
        this.nextPieceGraphics.clear();
        const offsetX = this.board.x + BOARD_WIDTH * BLOCK_SIZE + 20;
        const offsetY = this.board.y + 30;

        this.nextPieceGraphics.fillStyle(this.nextPiece.color, 1);
        this.nextPiece.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value) {
                    this.nextPieceGraphics.fillRect(
                        offsetX + c * 20, // Smaller blocks for preview
                        offsetY + r * 20,
                        19,
                        19
                    );
                }
            });
        });
    }
}
