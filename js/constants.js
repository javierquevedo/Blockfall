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
