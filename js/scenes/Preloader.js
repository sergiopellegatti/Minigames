class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
    }

    preload() {
        // Nothing to preload for now
    }

    create() {
        this.createPlaceholderGraphics();
        this.scene.start('level1', { levelData: level1Data });
    }

    createPlaceholderGraphics() {
        let g;

        // --- Platform ---
        g = this.add.graphics().fillStyle(0x888888).fillRect(0, 0, 100, 20);
        g.generateTexture('platform', 100, 20);
        g.destroy();

        // --- Player ---
        g = this.add.graphics();
        g.fillStyle(0xffff00).fillCircle(20, 20, 13); // Body
        g.fillStyle(0x888888).fillRect(15, 20, 10, 25); // Jetpack
        g.fillStyle(0x000000).fillCircle(15, 18, 2).fillCircle(25, 18, 2); // Eyes
        g.generateTexture('player', 40, 45);
        g.destroy();

        // --- Jetpack Icon ---
        g = this.add.graphics();
        g.fillStyle(0xcccccc).fillRect(-10, -15, 20, 30); // Body
        g.fillStyle(0x888888).strokeRect(-10, -15, 20, 30);
        g.fillStyle(0xffa500).slice(0, 25, 8, Phaser.Math.DegToRad(120), Phaser.Math.DegToRad(60), true).fillPath(); // Flame
        g.generateTexture('jetpack', 24, 40);
        g.destroy();

        // --- WaveMarble Icon ---
        g = this.add.graphics();
        g.fillStyle(0xd4e4ff, 0.7).fillCircle(15, 15, 15); // Marble
        g.lineStyle(2, 0xffffff).strokeCircle(15, 15, 15);
        g.lineStyle(1.5, 0x000000).beginPath().moveTo(5, 15).quadraticCurveTo(10, 5, 15, 15).quadraticCurveTo(20, 25, 25, 15).stroke(); // Wave
        g.generateTexture('waveMarble', 30, 30);
        g.destroy();

        // --- MagnifyingSphere Icon ---
        g = this.add.graphics();
        g.fillStyle(0xb4b4b4, 0.7).fillCircle(15, 15, 15); // Sphere
        g.lineStyle(2, 0xffffff).strokeCircle(15, 15, 15);
        g.lineStyle(3, 0x000000).lineBetween(22, 22, 30, 30); // Handle
        g.generateTexture('magnifyingSphere', 32, 32);
        g.destroy();
    }
}
