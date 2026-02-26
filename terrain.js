class Terrain {
    constructor() {
        this.points = [];
        this.chunkSize = 50; // Distance between points
        this.generateX = -1000;
        this.lastPoint = { x: -1000, y: 0 };
    }

    init() {
        this.points = [];
        this.generateX = -1000;
        // Pre-generate some flat terrain for spawn
        for (let x = -1000; x < 1000; x += this.chunkSize) {
            this.points.push({ x: x, y: 0 });
            this.generateX = x;
        }
    }

    heightFn(x) {
        // Flat start area
        if (x < 1000) return 0;

        let h = Math.sin(x * 0.005) * 40 +
            Math.sin(x * 0.01) * 20 +
            Math.sin(x * 0.002) * 120;

        // Add random roughness
        // h += (Math.random() * 10 - 5);

        return h;
    }

    update(playerX, screenWidth) {
        // Generate ahead
        const targetGenerateX = playerX + screenWidth * 2;
        while (this.generateX < targetGenerateX) {
            this.generateX += this.chunkSize;
            this.points.push({
                x: this.generateX,
                y: this.heightFn(this.generateX)
            });
        }

        // Remove behind
        const removeX = playerX - screenWidth;
        while (this.points.length > 2 && this.points[1].x < removeX) {
            this.points.shift();
        }
    }

    getHeightAt(x) {
        // Find segment
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            if (x >= p1.x && x <= p2.x) {
                // Interpolate
                const t = (x - p1.x) / (p2.x - p1.x);
                return p1.y + t * (p2.y - p1.y);
            }
        }
        return 0; // Fallback
    }

    getAngleAt(x) {
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            if (x >= p1.x && x <= p2.x) {
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }
        }
        return 0;
    }

    draw(ctx) {
        if (this.points.length === 0) return;

        // Bounding top to bottom of screen roughly
        let grad = ctx.createLinearGradient(0, camera.y || 0, 0, (camera.y || 0) + window.innerHeight + 1000);
        grad.addColorStop(0, "#8B4513");
        grad.addColorStop(1, "#1A0500");

        ctx.fillStyle = grad;
        ctx.strokeStyle = "#32CD32"; // Bright green grass edge
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        // Close path down to bottom of screen
        ctx.lineTo(this.points[this.points.length - 1].x, 3000);
        ctx.lineTo(this.points[0].x, 3000);
        ctx.closePath();
        ctx.fill();

        // Draw top line
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
    }
}

const terrain = new Terrain();
