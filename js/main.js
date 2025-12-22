const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    scene: [GameScene]
};

const game = new Phaser.Game(config);
