class Level1 extends Phaser.Scene {
    constructor() {
        super('level1');
        this.player = null;
        this.platforms = null;
        this.cursors = null;
        this.levelData = null;
    }

    init(data) {
        this.levelData = data.levelData;
    }

    create() {
        this.cameras.main.setBackgroundColor(this.levelData.background.color);

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.levelData.platforms.layout.forEach(p => {
            const platform = this.platforms.create(p.x + p.width / 2, 450 - p.y - p.height / 2, null);
            platform.displayWidth = p.width;
            platform.displayHeight = p.height;
            platform.refreshBody();
        });

        // Create player
        const startPlatform = this.platforms.getChildren()[0];
        const playerX = startPlatform.x;
        const playerY = startPlatform.y - startPlatform.displayHeight / 2 - 20;
        this.player = this.physics.add.sprite(playerX, playerY, null);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false);

        this.player.displayHeight = 40;
        this.player.displayWidth = 40;

        // Add collision
        this.physics.add.collider(this.player, this.platforms);

        // Set up camera
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 2500, 450);

        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (!this.player) return;

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        // Jumping
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(this.levelData.physics.jumpStrength * 30);
        }

        // Check for falling off the screen
        if (this.player.y > 450) {
            this.scene.restart({ levelData: this.levelData });
        }
    }
}
