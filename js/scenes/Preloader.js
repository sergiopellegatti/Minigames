class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
    }

    create() {
        this.scene.start('level1', { levelData: level1Data });
    }
}
