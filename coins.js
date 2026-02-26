class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.value = 10;
        this.rotation = 0;
        this.active = true;
        this.time = Math.random() * 100;
    }

    update() {
        if (!this.active) return;
        this.rotation += 0.1;
        this.time += 0.016 * 6;
        this.drawY = this.y + Math.sin(this.time) * 10; // Floating animation
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.drawY);
        // Simple 3D rotating effect using scale and rotation
        ctx.scale(Math.abs(Math.sin(this.rotation)), 1);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700"; // Gold
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#DAA520"; // Goldenrod outline
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

class CoinSystem {
    constructor() {
        this.coins = [];
        this.lastX = 500;
    }

    init() {
        this.coins = [];
        this.lastX = 500;
    }

    update(playerX, terrain) {
        // Spawn
        const targetX = playerX + window.innerWidth * 2;
        while (this.lastX < targetX) {
            this.lastX += 250;
            // Get terrain height at this coordinate
            const th = terrain.getHeightAt(this.lastX);
            const hOffset = Math.random() * 150 + 150; // spawn higher above ground
            this.coins.push(new Coin(this.lastX, th - hOffset));
        }

        // Cleanup and update
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (coin.x < playerX - window.innerWidth) {
                this.coins.splice(i, 1);
                continue;
            }
            coin.update();
        }
    }

    draw(ctx) {
        this.coins.forEach(c => c.draw(ctx));
    }
}
const coinSystem = new CoinSystem();
