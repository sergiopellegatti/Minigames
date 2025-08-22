// This will be populated in the next step
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [Preloader, Level1]
};

const game = new Phaser.Game(config);

console.log("main.js has run and Phaser game is instantiated.");
