const UI = {
    elements: {
        hud: document.getElementById('hud'),
        mainMenu: document.getElementById('main-menu'),
        gameOverMenu: document.getElementById('game-over-menu'),
        garageMenu: document.getElementById('garage-menu'),
        btnPlay: document.getElementById('btn-play'),
        btnGarage: document.getElementById('btn-garage'),
        btnRetry: document.getElementById('btn-retry'),
        btnMenu: document.getElementById('btn-menu'),
        btnGarageBack: document.getElementById('btn-garage-back'),
        vehicleList: document.getElementById('vehicle-list'),

        btnGas: document.getElementById('btn-gas'),
        btnBrake: document.getElementById('btn-brake'),

        fuelBarFill: document.getElementById('fuel-bar-fill'),
        scoreDisplay: document.getElementById('score-display'),
        distanceDisplay: document.getElementById('distance-display'),
        coinsDisplay: document.getElementById('coins-display'),

        rpmNeedle: document.getElementById('rpm-needle'),
        speedMeter: document.getElementById('speed-meter'),

        menuHighscore: document.getElementById('menu-highscore'),
        menuCoins: document.getElementById('menu-coins'),
        garageCoins: document.getElementById('garage-coins'),

        deathReason: document.getElementById('death-reason'),
        goDistance: document.getElementById('go-distance'),
        goCoins: document.getElementById('go-coins'),
        goScore: document.getElementById('go-score'),
    },

    showMenu(menuId) {
        this.elements.hud.classList.add('hidden');
        this.elements.mainMenu.classList.add('hidden');
        this.elements.gameOverMenu.classList.add('hidden');
        this.elements.garageMenu.classList.add('hidden');

        if (menuId === 'hud') this.elements.hud.classList.remove('hidden');
        else if (menuId === 'main') {
            this.elements.mainMenu.classList.remove('hidden');
            this.elements.menuHighscore.innerText = saveSystem.data.highScore;
            this.elements.menuCoins.innerText = saveSystem.data.coins;
        }
        else if (menuId === 'gameover') this.elements.gameOverMenu.classList.remove('hidden');
        else if (menuId === 'garage') {
            this.elements.garageMenu.classList.remove('hidden');
            this.populateGarage();
        }
    },

    populateGarage() {
        this.elements.garageCoins.innerText = saveSystem.data.coins;
        this.elements.vehicleList.innerHTML = '';

        for (const [key, v] of Object.entries(vehicles)) {
            const isUnlocked = saveSystem.data.unlockedVehicles.includes(key);
            const isSelected = saveSystem.data.currentVehicle === key;

            const card = document.createElement('div');
            card.className = `vehicle-card ${isSelected ? 'selected' : ''}`;

            card.innerHTML = `
                <div style="width: 60px; height: 30px; background-color: ${v.color}; margin-bottom: 10px; border-radius: 5px; border: 2px solid white;"></div>
                <h3>${v.name}</h3>
                <p>Speed: ${v.power}</p>
                <p>Weight: ${v.weight}</p>
                ${isUnlocked ? '' : `<div class="cost">Cost: 💰 ${v.cost}</div>`}
            `;

            const btn = document.createElement('button');
            if (isSelected) {
                btn.innerText = 'SELECTED';
                btn.className = 'primary-btn';
                btn.disabled = true;
            } else if (isUnlocked) {
                btn.innerText = 'SELECT';
                btn.className = 'primary-btn';
                btn.onclick = () => {
                    saveSystem.data.currentVehicle = key;
                    saveSystem.save();
                    this.populateGarage();
                };
            } else {
                btn.innerText = 'BUY';
                btn.className = 'secondary-btn';
                btn.onclick = () => {
                    if (saveSystem.spendCoins(v.cost)) {
                        saveSystem.data.unlockedVehicles.push(key);
                        saveSystem.data.currentVehicle = key;
                        saveSystem.save();
                        this.populateGarage();
                        sounds.playCoin(); // Buy sound
                    } else {
                        alert('Not enough coins!');
                    }
                };
            }
            card.appendChild(btn);
            this.elements.vehicleList.appendChild(card);
        }
    },

    updateHUD(score, distance, coins, fuelPercent, rpm, speed) {
        this.elements.scoreDisplay.innerText = "Score: " + Math.floor(score);
        this.elements.distanceDisplay.innerText = Math.floor(distance) + "m";
        this.elements.coinsDisplay.innerText = "💰 " + coins;

        this.elements.fuelBarFill.style.transform = `scaleX(${fuelPercent / 100})`;

        // RPM needle (-120deg to +120deg)
        // rpm max approx 6000
        let needleAngle = mapVal(Math.abs(rpm), 0, 6000, -120, 120);
        if (needleAngle > 120) needleAngle = 120;
        this.elements.rpmNeedle.style.transform = `rotate(${needleAngle}deg)`;

        this.elements.speedMeter.innerText = Math.floor(Math.abs(speed)) + " km/h";
    },

    showGameOver(reason, distance, coins, score) {
        this.showMenu('gameover');
        this.elements.deathReason.innerText = reason;
        this.elements.goDistance.innerText = Math.floor(distance);
        this.elements.goCoins.innerText = coins;
        this.elements.goScore.innerText = Math.floor(score);
    }
};
