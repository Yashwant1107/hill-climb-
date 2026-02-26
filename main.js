const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let car;
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let input = { gas: false, brake: false };

let distanceTraveled = 0;
let score = 0;
let runCoins = 0;
let bonusText = "";
let bonusTimer = 0;

let hasFlipped = false;
let flipTotalAngle = 0;
let lastAngle = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.resize();
}
window.addEventListener('resize', resize);
resize();

// Input Listeners
function setupInput() {
    const attachBtn = (btn, key) => {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); input[key] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); input[key] = false; });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); input[key] = true; });
        btn.addEventListener('mouseup', (e) => { e.preventDefault(); input[key] = false; });
        btn.addEventListener('mouseleave', (e) => { e.preventDefault(); input[key] = false; });
    };

    attachBtn(UI.elements.btnGas, 'gas');
    attachBtn(UI.elements.btnBrake, 'brake');

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') input.gas = true;
        if (e.key === 'ArrowLeft' || e.key === 'a') input.brake = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') input.gas = false;
        if (e.key === 'ArrowLeft' || e.key === 'a') input.brake = false;
    });
}

function startGame() {
    const vehicleKey = saveSystem.data.currentVehicle;
    const vStats = vehicles[vehicleKey];
    const vUpgrades = saveSystem.data.upgrades[vehicleKey];

    terrain.init();
    car = new Car(vStats, vUpgrades);

    // Position car down to terrain
    car.x = 0;
    car.y = -200;

    coinSystem.init();
    fuelSystem.init(vUpgrades.fuel);
    powerupSystem.init();

    distanceTraveled = 0;
    runCoins = 0;
    score = 0;
    bonusTimer = 0;

    hasFlipped = false;
    flipTotalAngle = 0;
    lastAngle = 0;

    gameState = 'PLAYING';
    UI.showMenu('hud');
}

function stopGame(reason) {
    gameState = 'GAMEOVER';
    saveSystem.addCoins(runCoins);
    saveSystem.updateHighScore(score);
    UI.showGameOver(reason, distanceTraveled / 10, runCoins, score);
}

function update() {
    if (gameState !== 'PLAYING') return;

    // Physics Update
    car.update(input, terrain);
    terrain.update(car.x, canvas.width);
    coinSystem.update(car.x, terrain);
    fuelSystem.update(car.x, terrain);

    // Consume Fuel
    fuelSystem.consume(car.wheelAngularVel, car.stats.fuelUsage);

    // Calculate progression
    if (car.x > distanceTraveled) distanceTraveled = car.x;
    score = (distanceTraveled / 10) * 5 + runCoins * 50;

    // Coins collection
    for (let i = coinSystem.coins.length - 1; i >= 0; i--) {
        const c = coinSystem.coins[i];
        if (c.active && distance(car.x, car.y, c.x, c.y) < 60) {
            c.active = false;
            runCoins += c.value;
            sounds.playCoin();
            car.power *= 1.02; // Increase normal speed permanently for this run
            car.vx += (car.power * 2); // Small push
        }
    }
    // Fuel collection
    for (let i = fuelSystem.canisters.length - 1; i >= 0; i--) {
        const f = fuelSystem.canisters[i];
        if (f.active && distance(car.x, car.y, f.x, f.y) < 60) {
            f.active = false;
            fuelSystem.refill();
            sounds.playFuel();
            car.power *= 1.05; // Increase normal speed permanently for this run
            car.vx += (car.power * 5); // Bigger push
        }
    }
    // Powerups collection
    powerupSystem.update(car.x, terrain);
    for (let i = powerupSystem.powerups.length - 1; i >= 0; i--) {
        const p = powerupSystem.powerups[i];
        if (p.active && distance(car.x, car.y, p.x, p.y) < 70) {
            p.active = false;
            sounds.playBonus(); // maybe specific powerup sound later
            if (p.type === 'boost') {
                car.boostTimer = 300; // 5 seconds at 60fps
                bonusText = "SPEED BOOST!";
                bonusTimer = 60;
                car.vx += 10;
            } else if (p.type === 'fly') {
                car.flyTimer = 300;
                bonusText = "FLIGHT MODE!";
                bonusTimer = 60;
                car.vy -= 10;
            }
        }
    }

    // Flip Detection logic using continuous angle accumulation
    let delta = car.rotation - lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    flipTotalAngle += delta;
    lastAngle = car.rotation;

    if (Math.abs(flipTotalAngle) >= Math.PI * 1.8) {
        runCoins += 1000;
        bonusText = "+1000 FLIP BONUS!";
        bonusTimer = 60;
        flipTotalAngle = 0;
        sounds.playBonus();
    }

    // Death Conditions
    // 1. Out of fuel (and car almost stopped)
    if (fuelSystem.currentFuel <= 0 && Math.abs(car.vx) < 0.5) {
        sounds.playCrash();
        stopGame("Out of Fuel");
        return;
    }

    // 2. Driver head hits floor based strictly on rotation and body height relative to ground
    const cosR = Math.cos(car.rotation);
    const sinR = Math.sin(car.rotation);
    // Simple top of driver head coordinates relative to car center
    const headDriverOffY = -car.stats.height - 20;
    const headX = car.x + headDriverOffY * -sinR;
    const headY = car.y + headDriverOffY * cosR;

    if (headY >= terrain.getHeightAt(headX)) {
        sounds.playCrash();
        stopGame("Driver Down!");
        return;
    }

    // Camera
    camera.update(car.x, car.y);

    // Update UI
    const rpm = car.wheelAngularVel * 200;
    const speed = Math.abs(car.vx * 2);
    UI.updateHUD(score, distanceTraveled / 10, runCoins, fuelSystem.getPercentage(), rpm, speed);
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Sun
    ctx.fillStyle = "#FFD700";
    ctx.shadowBlur = 40;
    ctx.shadowColor = "#FF8C00";
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, canvas.height * 0.4, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Distant mountains (Layer 1)
    ctx.fillStyle = "rgba(40, 10, 30, 0.5)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width; i += 20) {
        let h = Math.sin((i + camera.x * 0.03) * 0.005) * 150 + canvas.height * 0.5;
        ctx.lineTo(i, h);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Closer mountains (Layer 2)
    ctx.fillStyle = "rgba(20, 5, 20, 0.7)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width + 20; i += 20) {
        let h = Math.sin((i + camera.x * 0.08) * 0.01) * 100 + canvas.height * 0.6;
        ctx.lineTo(i, h);
    }
    ctx.lineTo(canvas.width + 20, canvas.height);
    ctx.fill();
}

function drawBonus(ctx) {
    if (bonusTimer > 0) {
        ctx.save();
        ctx.fillStyle = "gold";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;

        const drawY = car.y - 120 - (60 - bonusTimer); // Float up
        ctx.strokeText(bonusText, car.x, drawY);
        ctx.fillText(bonusText, car.x, drawY);
        ctx.restore();
        bonusTimer--;
    }
}

function loop() {
    requestAnimationFrame(loop);

    update();

    if (gameState === 'PLAYING') {
        drawBackground();

        // Start World Space
        camera.apply(ctx);

        terrain.draw(ctx);
        coinSystem.draw(ctx);
        fuelSystem.draw(ctx);
        powerupSystem.draw(ctx);

        car.draw(ctx);
        drawBonus(ctx);

        camera.restore(ctx);
        // End World Space
    }
}

// Initial Setup
UI.showMenu('main');

UI.elements.btnPlay.addEventListener('click', () => {
    sounds.initAudio();
    sounds.playBGM();
    startGame();
});

UI.elements.btnRetry.addEventListener('click', () => {
    sounds.playBGM();
    startGame();
});

UI.elements.btnMenu.addEventListener('click', () => {
    sounds.stopBGM();
    UI.showMenu('main');
});

UI.elements.btnGarage.addEventListener('click', () => {
    sounds.initAudio();
    UI.showMenu('garage');
});

UI.elements.btnGarageBack.addEventListener('click', () => {
    UI.showMenu('main');
});

setupInput();
loop();
