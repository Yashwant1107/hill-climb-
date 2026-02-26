class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.type = type; // 'boost' or 'fly'
        this.active = true;
        this.time = Math.random() * 100;
    }

    update() {
        if (!this.active) return;
        this.time += 0.05;
        this.drawY = this.y + Math.sin(this.time) * 15;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.drawY);

        // Halo
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.type === 'boost' ? "#FF4500" : "#00FFFF";

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'boost' ? "#FF8C00" : "#87CEFA";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();

        // Symbol
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 20px sans-serif";
        ctx.shadowBlur = 0;
        if (this.type === 'boost') {
            ctx.fillText(">>", 0, 7);
        } else {
            ctx.fillText("🪽", 0, 7);
        }

        ctx.restore();
    }
}

class PowerupSystem {
    constructor() {
        this.powerups = [];
        this.lastX = 1500;
    }

    init() {
        this.powerups = [];
        this.lastX = 1500;
    }

    update(playerX, terrain) {
        const targetX = playerX + window.innerWidth * 2;
        while (this.lastX < targetX) {
            this.lastX += 1200 + Math.random() * 500; // 1200 - 1700 apart
            const th = terrain.getHeightAt(this.lastX);
            const type = Math.random() > 0.5 ? 'boost' : 'fly';
            // Spawn just above terrain
            this.powerups.push(new Powerup(this.lastX, th - 100, type));
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            if (p.x < playerX - window.innerWidth) {
                this.powerups.splice(i, 1);
                continue;
            }
            p.update();
        }
    }

    draw(ctx) {
        this.powerups.forEach(p => p.draw(ctx));
    }
}
const powerupSystem = new PowerupSystem();
