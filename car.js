class Car {
    constructor(vStats, upgrades) {
        this.stats = vStats;
        this.x = 200;
        this.y = -200;

        // Physics state
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0; // Body angle
        this.angularVelocity = 0;

        // Powerup states
        this.flyTimer = 0;
        this.boostTimer = 0;

        // Upgrades calculation
        // Torque multiplier
        this.power = this.stats.power * (1 + (upgrades.engine * upgradesInfo.engine.valuePerLevel));
        // Suspension stiffness
        this.stiffness = 0.25 * (1 + (upgrades.suspension * upgradesInfo.suspension.valuePerLevel));
        this.damping = 0.12;
        // Grip multiplier
        this.grip = this.stats.grip * (1 + (upgrades.grip * upgradesInfo.grip.valuePerLevel));

        this.wheelAngularVel = 0;

        // Parts
        this.wheelRadius = this.stats.wheelRadius;
        this.frontWheel = { x: this.x + this.stats.wheelOffset, y: this.y + this.stats.suspensionLength, rot: 0 };
        this.backWheel = { x: this.x - this.stats.wheelOffset, y: this.y + this.stats.suspensionLength, rot: 0 };
    }

    update(input, terrain) {
        // Decrease timers
        if (this.flyTimer > 0) this.flyTimer--;
        if (this.boostTimer > 0) this.boostTimer--;

        // Core Physics loop
        // Gravity (less gravity if flying)
        let currentGravity = (this.flyTimer > 0) ? gravity * 0.2 : gravity;
        this.vy += currentGravity * this.stats.weight;

        // Input Acceleration
        // If boost is active, double power
        const effectivePower = (this.boostTimer > 0) ? this.power * 2 : this.power;
        const enginePower = effectivePower;
        const brakePower = effectivePower * 0.8;

        if (input.gas) {
            this.wheelAngularVel += enginePower;
            if (this.flyTimer > 0) {
                // Fly upward force
                this.vy -= 0.5;
                // Forward force while flying
                this.vx += effectivePower * 1.5;
            }
        } else if (input.brake) {
            this.wheelAngularVel -= brakePower; // Also works as reverse
        } else {
            // Natural friction / slowdown of engine rotation
            this.wheelAngularVel *= 0.98;
        }

        // Cap wheel velocity
        const maxSpeed = 30 + (this.power * 100);
        if (this.wheelAngularVel > maxSpeed) this.wheelAngularVel = maxSpeed;
        if (this.wheelAngularVel < -maxSpeed) this.wheelAngularVel = -maxSpeed;

        // Apply velocities to position
        this.x += this.vx;
        this.y += this.vy;

        // Determine wheel positions based on body
        const cosR = Math.cos(this.rotation);
        const sinR = Math.sin(this.rotation);

        // Target wheel positions relative to car body before suspension
        const targetFX = this.x + this.stats.wheelOffset * cosR - this.stats.suspensionLength * sinR;
        const targetFY = this.y + this.stats.wheelOffset * sinR + this.stats.suspensionLength * cosR;

        const targetBX = this.x - this.stats.wheelOffset * cosR - this.stats.suspensionLength * sinR;
        const targetBY = this.y - this.stats.wheelOffset * sinR + this.stats.suspensionLength * cosR;

        // Collisions with Terrain
        let fOnGround = false;
        let bOnGround = false;

        const thF = terrain.getHeightAt(targetFX);
        const thB = terrain.getHeightAt(targetBX);

        this.frontWheel.x = targetFX;
        this.frontWheel.y = targetFY;
        this.backWheel.x = targetBX;
        this.backWheel.y = targetBY;

        // Ground constraint - if wheel goes below ground, push it up
        if (this.frontWheel.y + this.wheelRadius >= thF) {
            this.frontWheel.y = thF - this.wheelRadius;
            fOnGround = true;
        }
        if (this.backWheel.y + this.wheelRadius >= thB) {
            this.backWheel.y = thB - this.wheelRadius;
            bOnGround = true;
        }

        // Suspension force back to body
        // Only apply strong upward force if wheel is compressed (i.e. on ground)
        if (fOnGround || bOnGround) {
            const fDiff = this.frontWheel.y - targetFY; // Positive if compressed
            const bDiff = this.backWheel.y - targetBY;

            let avgPushY = 0;
            if (fOnGround) avgPushY += fDiff * this.stiffness;
            if (bOnGround) avgPushY += bDiff * this.stiffness;

            // Apply dampening and push
            this.vy *= (1 - this.damping);
            this.vy += avgPushY;

            // Forward movement from wheels based on terrain angle
            const terrainAngle = fOnGround ? terrain.getAngleAt(this.frontWheel.x) : (bOnGround ? terrain.getAngleAt(this.backWheel.x) : 0);
            const forwardForce = this.wheelAngularVel * this.grip * 0.01;

            this.vx += Math.cos(terrainAngle) * forwardForce;
            this.vy += Math.sin(terrainAngle) * forwardForce;

            // Friction
            this.vx *= 0.95;

            // Rotation derived from wheel heights mapping to body
            const targetRot = Math.atan2(this.frontWheel.y - this.backWheel.y, this.frontWheel.x - this.backWheel.x);
            let rotDiff = targetRot - this.rotation;

            // Normalize rotDiff
            while (rotDiff > Math.PI) rotDiff -= 2 * Math.PI;
            while (rotDiff < -Math.PI) rotDiff += 2 * Math.PI;

            this.angularVelocity += rotDiff * 0.1;

        } else {
            // In air
            this.angularVelocity *= 0.98; // Air resistance on rotation

            // Stunt spin control
            if (input.gas) this.angularVelocity -= this.power * 0.05;
            if (input.brake) this.angularVelocity += this.power * 0.05;
        }

        // Apply rotation
        this.angularVelocity *= 0.9;
        this.rotation += this.angularVelocity;

        // General air friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Visual wheel rotation
        let visualRot = this.wheelAngularVel * 0.1;
        this.frontWheel.rot += visualRot + (this.vx * 0.05);
        this.backWheel.rot += visualRot + (this.vx * 0.05);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Suspension lines
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 6;
        ctx.lineCap = "round";

        const invRot = -this.rotation;

        const localFx = (this.frontWheel.x - this.x) * Math.cos(invRot) - (this.frontWheel.y - this.y) * Math.sin(invRot);
        const localFy = (this.frontWheel.x - this.x) * Math.sin(invRot) + (this.frontWheel.y - this.y) * Math.cos(invRot);

        const localBx = (this.backWheel.x - this.x) * Math.cos(invRot) - (this.backWheel.y - this.y) * Math.sin(invRot);
        const localBy = (this.backWheel.x - this.x) * Math.sin(invRot) + (this.backWheel.y - this.y) * Math.cos(invRot);

        ctx.beginPath();
        ctx.moveTo(this.stats.wheelOffset, 0); ctx.lineTo(localFx, localFy);
        ctx.moveTo(-this.stats.wheelOffset, 0); ctx.lineTo(localBx, localBy);
        ctx.stroke();

        // Check if boosting or flying and draw exhaust / thrusters
        if (this.boostTimer > 0 || this.flyTimer > 0 || this.wheelAngularVel > 10) {
            ctx.fillStyle = (this.flyTimer > 0) ? "#00FFFF" : "#FF4500";
            ctx.beginPath();
            ctx.moveTo(-this.stats.width / 2, -this.stats.height / 3);
            let flameLen = -this.stats.width / 2 - (20 + Math.random() * 20);
            if (this.boostTimer > 0) flameLen -= 20;
            ctx.lineTo(flameLen, -this.stats.height / 3 + 5);
            ctx.lineTo(-this.stats.width / 2, -this.stats.height / 3 + 10);
            ctx.fill();

            // Inner flame
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.moveTo(-this.stats.width / 2, -this.stats.height / 3 + 3);
            ctx.lineTo(flameLen + 10, -this.stats.height / 3 + 5);
            ctx.lineTo(-this.stats.width / 2, -this.stats.height / 3 + 7);
            ctx.fill();
        }

        // Car Body Gradient
        let grad = ctx.createLinearGradient(0, -this.stats.height, 0, 0);
        grad.addColorStop(0, '#ffffff'); // shiny top
        grad.addColorStop(0.2, this.stats.color);
        grad.addColorStop(1, '#111111'); // dark bottom

        ctx.fillStyle = grad;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // Main block
        ctx.beginPath();
        ctx.roundRect(-this.stats.width / 2, -this.stats.height, this.stats.width, this.stats.height, 15);
        ctx.fill();

        // Remove shadow for rest of draw
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Striping / Detail
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.rect(-this.stats.width / 2, -this.stats.height / 2, this.stats.width, 5);
        ctx.fill();

        // Cockpit window block
        let glassGrad = ctx.createLinearGradient(0, -this.stats.height - 20, 0, -this.stats.height);
        glassGrad.addColorStop(0, "#E0FFFF");
        glassGrad.addColorStop(1, "#4682B4");

        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.roundRect(-this.stats.width / 5, -this.stats.height - 25, this.stats.width / 2.2, 25, 8);
        ctx.fill();

        // Window shiny reflection
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(-this.stats.width / 5 + 5, -this.stats.height - 20);
        ctx.lineTo(-this.stats.width / 5 + 15, -this.stats.height - 20);
        ctx.lineTo(-this.stats.width / 5 + 5, -this.stats.height - 5);
        ctx.fill();

        // Draw driver head marker inside cockpit offset
        ctx.fillStyle = "#FFC0CB";
        ctx.beginPath();
        ctx.arc(0, -this.stats.height - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        // Driver Helmet
        ctx.fillStyle = "#eeeeee";
        ctx.beginPath();
        ctx.arc(0, -this.stats.height - 10, 11, Math.PI, Math.PI * 2);
        ctx.fill();
        // Helmet visor
        ctx.fillStyle = "#111111";
        ctx.fillRect(5, -this.stats.height - 15, 6, 5);

        // If flying, draw some wing visuals
        if (this.flyTimer > 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            ctx.moveTo(0, -this.stats.height / 2);
            ctx.lineTo(30, -this.stats.height - 40);
            ctx.lineTo(-20, -this.stats.height - 40);
            ctx.fill();
        }

        ctx.restore();

        // Draw Wheels in World Space
        this.drawWheel(ctx, this.frontWheel);
        this.drawWheel(ctx, this.backWheel);
    }

    drawWheel(ctx, wheel) {
        ctx.save();
        ctx.translate(wheel.x, wheel.y);
        ctx.rotate(wheel.rot);

        // Tire Drop Shadow
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 5;

        // Tire base
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(0, 0, this.wheelRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Tire treads (outer edge pattern)
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, this.wheelRadius - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Rim metallic gradient
        let rimGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.wheelRadius * 0.65);
        rimGrad.addColorStop(0, "#eeeeee");
        rimGrad.addColorStop(0.8, "#888888");
        rimGrad.addColorStop(1, "#333333");

        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.wheelRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Spokes
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let a = (Math.PI * 2 / 5) * i;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * (this.wheelRadius * 0.65), Math.sin(a) * (this.wheelRadius * 0.65));
        }
        ctx.stroke();

        // Center nut
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.arc(0, 0, this.wheelRadius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
