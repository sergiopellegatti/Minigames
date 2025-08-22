class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
    }

    preload() {
        this.createPlaceholderGraphics();
        console.log("Preloader: preload complete, textures created.");
    }

    create() {
        console.log("Preloader: create");
        this.scene.start('level1', { levelData: level1Data });
    }

    createPlaceholderGraphics() {
        // Create platform texture
        let platformGraphics = this.add.graphics();
        platformGraphics.fillStyle(0x888888, 1);
        platformGraphics.fillRect(0, 0, 100, 20);
        platformGraphics.generateTexture('platform', 100, 20);
        platformGraphics.destroy();

        // Create player texture
        let playerGraphics = this.add.graphics();
        // Body
        playerGraphics.fillStyle(0xffff00, 1);
        playerGraphics.fillCircle(20, 20, 13);
        // Jetpack
        playerGraphics.fillStyle(0x888888, 1);
        playerGraphics.fillRect(15, 20, 10, 25);
        // Eyes
        playerGraphics.fillStyle(0x000000, 1);
        playerGraphics.fillCircle(15, 18, 2);
        playerGraphics.fillCircle(25, 18, 2);
        playerGraphics.generateTexture('player', 40, 45);
        playerGraphics.destroy();
    }
}
