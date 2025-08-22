class Level1 extends Phaser.Scene {
    constructor() {
        super('level1');
        this.player = null;
        this.platforms = null;
        this.cursors = null;
        this.levelData = null;
        this.hud = null; // To hold HUD elements
        // --- Touch Control Flags ---
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
    }

    init(data) {
        this.levelData = data.levelData;
    }

    create() {
        console.log("Level1 create: Start");
        this.cameras.main.setBackgroundColor(this.levelData.background.color);

        // --- Platforms ---
        this.platforms = this.physics.add.staticGroup();
        this.levelData.platforms.layout.forEach(p => {
            const platform = this.platforms.create(p.x + p.width / 2, 450 - p.y - p.height / 2, 'platform');
            platform.displayWidth = p.width;
            platform.displayHeight = p.height;
            platform.refreshBody();
        });

        // --- Player ---
        const startPlatform = this.platforms.getChildren()[0];
        this.player = this.physics.add.sprite(startPlatform.x, startPlatform.y - 50, 'player');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false);
        this.physics.add.collider(this.player, this.platforms);

        // --- Player Abilities (Temporary for testing HUD) ---
        this.player.abilities = {
            doubleJump: { active: true, permanent: false, timer: 400, duration: 600, icon: 'jetpack' },
            split: { active: true, permanent: false, timer: 200, duration: 300, icon: 'waveMarble' }
        };

        // --- Camera ---
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 2500, 450);

        // --- Input ---
        this.cursors = this.input.keyboard.createCursorKeys();
        console.log("Level1 create: Calling createControls...");
        this.createControls();
        console.log("Level1 create: createControls finished.");

        // --- HUD ---
        this.hud = this.add.group();
        console.log("Level1 create: End. HUD group created.");
    }

    update() {
        if (!this.player) return;

        // --- Player Movement ---
        if (this.cursors.left.isDown || this.moveLeft) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown || this.moveRight) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || this.jump) && this.player.body.touching.down) {
            this.player.setVelocityY(this.levelData.physics.jumpStrength * 30);
        }
        this.jump = false;

        // --- HUD Update ---
        console.log("Level1 update: Calling updateHUD...");
        this.updateHUD();
        console.log("Level1 update: updateHUD finished.");


        // --- Fall Check ---
        if (this.player.y > 450) {
            this.scene.restart({ levelData: this.levelData });
        }
    }

    createControls() {
        console.log("createControls: Start");
        const { width, height } = this.cameras.main;
        const buttonSize = 70;
        const margin = 20;

        const leftButton = this.add.rectangle(margin + buttonSize / 2, height - margin - buttonSize / 2, buttonSize, buttonSize, 0x000000, 0.5).setInteractive().setScrollFactor(0);
        leftButton.on('pointerdown', () => { this.moveLeft = true; });
        leftButton.on('pointerup', () => { this.moveLeft = false; });
        leftButton.on('pointerout', () => { this.moveLeft = false; });

        const rightButton = this.add.rectangle(margin * 2 + buttonSize * 1.5, height - margin - buttonSize / 2, buttonSize, buttonSize, 0x000000, 0.5).setInteractive().setScrollFactor(0);
        rightButton.on('pointerdown', () => { this.moveRight = true; });
        rightButton.on('pointerup', () => { this.moveRight = false; });
        rightButton.on('pointerout', () => { this.moveRight = false; });

        const jumpButton = this.add.rectangle(width - margin - buttonSize / 2, height - margin - buttonSize / 2, buttonSize, buttonSize, 0x000000, 0.5).setInteractive().setScrollFactor(0);
        jumpButton.on('pointerdown', () => { this.jump = true; });
        console.log("createControls: End");
    }

    updateHUD() {
        console.log("updateHUD: Start");
        this.hud.clear(true, true);
        const activePowerUps = Object.values(this.player.abilities).filter(a => a.active && !a.permanent);
        if (activePowerUps.length === 0) {
            console.log("updateHUD: No active powerups.");
            return;
        }

        const barWidth = 60;
        const totalWidth = activePowerUps.length * (barWidth + 10);
        let startX = this.cameras.main.width / 2 - totalWidth / 2;

        for (const ability of activePowerUps) {
            console.log(`updateHUD: Processing ability ${ability.icon}`);
            if (ability.timer > 0) ability.timer--;

            const iconX = startX + barWidth / 2;
            const icon = this.add.image(iconX, 30, ability.icon).setScale(0.8);

            const bar = this.add.graphics();
            const progress = ability.timer / ability.duration;
            bar.fillStyle(0xffffff, 0.3).fillRect(startX, 50, barWidth, 8);
            bar.fillStyle(0xffffff, 1).fillRect(startX, 50, barWidth * progress, 8);

            this.hud.add(icon);
            this.hud.add(bar);
            startX += barWidth + 10;
        }
        console.log("updateHUD: End");
    }
}
