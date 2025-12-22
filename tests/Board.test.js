const expect = chai.expect;

describe('Board Class', () => {
    let board;

    beforeEach(() => {
        board = new Board(window.mockScene, 0, 0);
    });

    it('should initialize with empty grid', () => {
        expect(board.grid.length).to.equal(BOARD_HEIGHT);
        expect(board.grid[0].length).to.equal(BOARD_WIDTH);
        expect(board.grid[0][0]).to.equal(0);
    });

    it('should spawn a piece correctly', () => {
        const tetromino = TETROMINOS.I;
        const success = board.spawn(tetromino);
        expect(success).to.be.true;
        expect(board.activePiece).to.not.be.null;
        expect(board.activePiece.shape).to.deep.equal(tetromino.shape);
    });

    it('should detect valid moves', () => {
        board.spawn(TETROMINOS.O); // 2x2 block
        // Move right
        const valid = board.isValidMove(1, 0, board.activePiece.shape);
        expect(valid).to.be.true;
    });

    it('should detect invalid moves (walls)', () => {
        board.spawn(TETROMINOS.O);
        // Move way outside right
        const invalidRight = board.isValidMove(BOARD_WIDTH, 0, board.activePiece.shape);
        expect(invalidRight).to.be.false;

        // Move way outside left
        const invalidLeft = board.isValidMove(-10, 0, board.activePiece.shape);
        expect(invalidLeft).to.be.false;
    });

    it('should detect invalid moves (floor)', () => {
        board.spawn(TETROMINOS.O);
        // Move way down
        const invalidDown = board.isValidMove(0, BOARD_HEIGHT, board.activePiece.shape);
        expect(invalidDown).to.be.false;
    });

    it('should detect collision with other pieces', () => {
        // Fill a spot at bottom left
        board.grid[BOARD_HEIGHT - 1][0] = 1;

        board.spawn(TETROMINOS.I);
        // Manually place piece right above the block
        board.activePiece.x = 0;
        board.activePiece.y = BOARD_HEIGHT - 2; // Just above

        // Try to move down into it (assuming I piece is horizontal [1,1,1,1])
        // Wait, I piece shape is [[1,1,1,1]]. Width 4, Height 1.
        // If y is H-2, it occupies row H-2. Moving down to H-1 should collide.

        const collision = board.isValidMove(0, 1, board.activePiece.shape);
        expect(collision).to.be.false;
    });

    it('should clear lines', () => {
        // Fill last row
        board.grid[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill(1);

        // Use exposed helper
        board.removeLines([BOARD_HEIGHT - 1]);

        // Verify row is cleared (top row should be empty, formerly full row gone)
        expect(board.grid[BOARD_HEIGHT - 1]).to.deep.equal(Array(BOARD_WIDTH).fill(0));

        // Also verify the array length matches (shifted in new row)
        expect(board.grid[0]).to.deep.equal(Array(BOARD_WIDTH).fill(0));
    });
});
