// Mock Phaser environment for testing
const mockGraphics = {
    clear: () => { },
    fillStyle: () => { },
    fillRect: () => { },
    lineStyle: () => { },
    strokeRect: () => { },
    destroy: () => { }
};

const mockScene = {
    add: {
        graphics: () => mockGraphics
    },
    tweens: {
        add: (config) => {
            if (config.onComplete) config.onComplete();
        }
    }
};

// Expose checks for tests if needed
window.mockScene = mockScene;
