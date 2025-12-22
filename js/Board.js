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
                this.removeLines(linesToClear);
                this.isClearing = false;
                this.spawnOnNextUpdate(linesToClear.length, onLockCallback);
            });
        } else {
            this.spawnOnNextUpdate(0, onLockCallback);
        }
    }

    removeLines(linesToClear) {
        linesToClear.sort((a, b) => a - b); // Ascending order
        linesToClear.forEach(r => {
            this.grid.splice(r, 1);
            this.grid.unshift(Array(BOARD_WIDTH).fill(0));
        });
    }

    spawnOnNextUpdate(linesCleared, callback) {
        if (callback) callback(linesCleared);
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
