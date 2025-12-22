const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], color: 0x00ffff },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 0x0000ff },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 0xffa500 },
    O: { shape: [[1, 1], [1, 1]], color: 0xffff00 },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 0x00ff00 },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 0x800080 },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 0xff0000 }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

class Board {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.grid = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        console.log(`Board Created. Dimensions: ${this.grid.length}x${this.grid[0].length}`);
        this.activePiece = null;
        this.graphics = this.scene.add.graphics();
        this.isClearing = false;
    }

    spawn(tetromino) {
        console.log("Spawning Piece:", JSON.stringify(tetromino.shape));
        // Reset X/Y to top center
        const startX = Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2);
        const startY = 0;

        this.activePiece = {
            shape: tetromino.shape,
            color: tetromino.color,
            x: startX,
            y: startY
        };
        console.log(`Piece Position: X=${this.activePiece.x}, Y=${this.activePiece.y}`);

        // Check collision immediately
        if (!this.isValidMove(0, 0, this.activePiece.shape)) {
            console.error("Spawn Failed: Invalid Move immediately on spawn");
            // Game Over logic placeholder
            this.grid = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
            console.log("Spawn failed at", startX, startY);
            return false;
        }
        console.log("Spawn Success");
        return true;
    }

    rotate() {
        if (!this.activePiece || this.isClearing) return;
        const matrix = this.activePiece.shape;
        const N = matrix.length;
        const M = matrix[0].length;
        const newShape = Array(M).fill().map(() => Array(N).fill(0));

        // Rotate 90 degrees clockwise
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < M; x++) {
                newShape[x][N - 1 - y] = matrix[y][x];
            }
        }

        if (this.isValidMove(0, 0, newShape)) {
            this.activePiece.shape = newShape;
        }
    }

    move(dx, dy) {
        if (!this.activePiece || this.isClearing) return false;
        if (this.isValidMove(dx, dy, this.activePiece.shape)) {
            this.activePiece.x += dx;
            this.activePiece.y += dy;
            return true;
        }
        return false;
    }

    isValidMove(dx, dy, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = this.activePiece.x + c + dx;
                    const newY = this.activePiece.y + r + dy;

                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                        return false;
                    }
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    lock(onLockCallback) {
        // 1. Lock piece into grid
        this.activePiece.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value) {
                    const y = this.activePiece.y + r;
                    const x = this.activePiece.x + c;
                    if (y >= 0) {
                        this.grid[y][x] = this.activePiece.color;
                    }
                }
            });
        });

        this.activePiece = null; // Hide active piece immediately

        // 2. Check for full lines
        const linesToClear = [];
        for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell !== 0)) {
                linesToClear.push(r);
            }
        }

        if (linesToClear.length > 0) {
            this.isClearing = true;
            this.animateClear(linesToClear, () => {
                // Remove lines after animation
                linesToClear.sort((a, b) => a - b); // Ascending order
                linesToClear.forEach(r => {
                    this.grid.splice(r, 1);
                    this.grid.unshift(Array(BOARD_WIDTH).fill(0));
                });

                this.isClearing = false;
                this.spawnOnNextUpdate(linesToClear.length, onLockCallback);
            });
        } else {
            this.spawnOnNextUpdate(0, onLockCallback);
        }
    }

    spawnOnNextUpdate(linesCleared, callback) {
        if (callback) callback(linesCleared);
        // We return true/false for spawn success in the Player loop usually, 
        // but here we rely on the Player to call spawnNextPiece? 
        // No, lock was called by Player. 
        // But Player.update expects lock to finish.
        // If async, we need to notify Player to spawn.
        // Actually, Player passed a callback. We can use that.
    }

    animateClear(lines, onComplete) {
        // Create a flash effect
        const flashGraphics = this.scene.add.graphics();
        flashGraphics.fillStyle(0xffffff, 1);

        lines.forEach(r => {
            flashGraphics.fillRect(this.x, this.y + r * BLOCK_SIZE, BOARD_WIDTH * BLOCK_SIZE, BLOCK_SIZE);
        });

        this.scene.tweens.add({
            targets: flashGraphics,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                flashGraphics.destroy();
                onComplete();
            }
        });
    }

    render() {
        this.graphics.clear();

        // Draw board background
        this.graphics.fillStyle(0x000000, 0.5);
        this.graphics.fillRect(this.x, this.y, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
        this.graphics.lineStyle(2, 0xffffff, 0.1);
        this.graphics.strokeRect(this.x, this.y, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

        // Draw grid
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                if (this.grid[r][c]) {
                    this.graphics.fillStyle(this.grid[r][c], 1);
                    this.graphics.fillRect(
                        this.x + c * BLOCK_SIZE,
                        this.y + r * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }

        // Draw active piece
        if (this.activePiece) {
            this.graphics.fillStyle(this.activePiece.color, 1);
            this.activePiece.shape.forEach((row, r) => {
                row.forEach((value, c) => {
                    if (value) {
                        this.graphics.fillRect(
                            this.x + (this.activePiece.x + c) * BLOCK_SIZE,
                            this.y + (this.activePiece.y + r) * BLOCK_SIZE,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }
    }
}

class Player {
    constructor(scene, boardX, boardY, controls, playerId, onGameOver) {
        this.scene = scene;
        this.interactionPaused = false;
        this.playerId = playerId;
        this.onGameOver = onGameOver;
        this.board = new Board(scene, boardX, boardY);
        this.controls = controls;
        this.score = 0;
        this.nextDropTime = this.scene.time.now + 1000; // Initialize with current time
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
        if (this.interactionPaused || this.board.isClearing) return; // Wait if clearing

        if (!this.board.activePiece) return; // Should not happen unless spawn failed

        // Gravity
        if (time > this.nextDropTime) {
            if (!this.board.move(0, 1)) {
                this.board.lock((linesCleared) => {
                    if (linesCleared > 0) {
                        this.score += linesCleared * 100; // Simple scoring
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

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: [GameScene]
};

const game = new Phaser.Game(config);
