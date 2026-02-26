class FuelCanister {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.active = true;
        this.time = Math.random() * 100;
    }

    update() {
        if (!this.active) return;
        this.time += 0.016 * 4;
        this.drawY = this.y + Math.sin(this.time) * 5;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.drawY);

        ctx.fillStyle = "#FF3333";
        ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);

        // Handle
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, -this.height);
        ctx.lineTo(-10, -this.height - 10);
        ctx.lineTo(10, -this.height - 10);
        ctx.lineTo(10, -this.height);
        ctx.stroke();

        // Text
        ctx.fillStyle = "white";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("FUEL", 0, -this.height / 2 + 4);

        ctx.restore();
    }
}

class FuelSystem {
    constructor() {
        this.maxFuel = 100;
        this.currentFuel = 100;
        this.canisters = [];
        this.lastX = 1000;
    }

    init(fuelUpgradeLevel) {
        const upgradeData = upgradesInfo.fuel;
        this.maxFuel = 100 * (1 + fuelUpgradeLevel * upgradeData.valuePerLevel);
        this.currentFuel = this.maxFuel;
        this.canisters = [];
        this.lastX = 1000;
    }

    consume(speed, baseUsage) {
        // speed usage
        this.currentFuel -= Math.abs(speed) * 0.0008 * baseUsage;
        // constant usage
        this.currentFuel -= 0.02 * baseUsage; // About 1.2 per second at 60fps

        if (this.currentFuel < 0) this.currentFuel = 0;
    }

    refill() {
        this.currentFuel += this.maxFuel * 0.3; // +30%
        if (this.currentFuel > this.maxFuel) this.currentFuel = this.maxFuel;
    }

    getPercentage() {
        if (this.currentFuel <= 0) return 0;
        return (this.currentFuel / this.maxFuel) * 100;
    }

    update(playerX, terrain) {
        const targetX = playerX + window.innerWidth * 2;
        while (this.lastX < targetX) {
            this.lastX += 900 + Math.random() * 300; // 900 - 1200
            const th = terrain.getHeightAt(this.lastX);
            this.canisters.push(new FuelCanister(this.lastX, th - 200));
        }

        for (let i = this.canisters.length - 1; i >= 0; i--) {
            const c = this.canisters[i];
            if (c.x < playerX - window.innerWidth) {
                this.canisters.splice(i, 1);
                continue;
            }
            c.update();
        }
    }

    draw(ctx) {
        this.canisters.forEach(c => c.draw(ctx));
    }
}

const fuelSystem = new FuelSystem();
