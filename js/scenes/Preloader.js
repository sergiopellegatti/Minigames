class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
    }

    preload() {
        // In the future, we will load assets here
        console.log("Preloader: preload");
    }

    create() {
        console.log("Preloader: create");
        // Pass the level data object to the scene
        this.scene.start('level1', { levelData: level1Data });
    }
}
