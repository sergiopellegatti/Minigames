class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
        console.log("Preloader: constructor");
    }

    preload() {
        console.log("Preloader: preload");
        // In the future, we will load assets here
    }

    create() {
        console.log("Preloader: create");
        // Pass the level data object to the scene
        this.scene.start('level1', { levelData: level1Data });
    }
}
