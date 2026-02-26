class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    update(targetX, targetY) {
        // Camera follows player smoothly
        // CameraX = PlayerX - ScreenWidth/3
        const targetCamX = targetX - this.width / 3;
        // CameraY = SmoothFollow(PlayerY - 120px)
        const targetCamY = targetY - 120;

        // Slight lag for mobile feel
        this.x += (targetCamX - this.x) * 0.08;
        this.y += (targetCamY - this.y) * 0.05;

        // Prevent camera from going completely underground if player is high
        // Or keep it relatively bounded
    }

    apply(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y + this.height / 2); // Center y vertically based on screen
    }

    restore(ctx) {
        ctx.restore();
    }
}

const camera = new Camera();
