const saveSystem = {
    data: {
        coins: 9999999, // Unlimited coins for testing
        highScore: 0,
        unlockedVehicles: ['jeep'],
        currentVehicle: 'jeep',
        upgrades: {
            jeep: { engine: 0, suspension: 0, grip: 0, fuel: 0 },
            bike: { engine: 0, suspension: 0, grip: 0, fuel: 0 },
            monster: { engine: 0, suspension: 0, grip: 0, fuel: 0 },
            bus: { engine: 0, suspension: 0, grip: 0, fuel: 0 },
            sports: { engine: 0, suspension: 0, grip: 0, fuel: 0 },
            formula1: { engine: 0, suspension: 0, grip: 0, fuel: 0 },
            hypercar: { engine: 0, suspension: 0, grip: 0, fuel: 0 }
        }
    },
    load() {
        const saved = localStorage.getItem('hillDriveSave');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge to keep new structure intact
                this.data = { ...this.data, ...parsed };

                // Force unlimited coins for now
                this.data.coins = 9999999;

                // Also merge upgrades deeply
                if (parsed.upgrades) {
                    for (let k in parsed.upgrades) {
                        this.data.upgrades[k] = { ...this.data.upgrades[k], ...parsed.upgrades[k] };
                    }
                }
            } catch (e) {
                console.error("Save load error", e);
            }
        }
    },
    save() {
        localStorage.setItem('hillDriveSave', JSON.stringify(this.data));
    },
    addCoins(amount) {
        this.data.coins += amount;
        this.save();
    },
    spendCoins(amount) {
        if (this.data.coins >= amount) {
            this.data.coins -= amount;
            this.save();
            return true;
        }
        return false;
    },
    updateHighScore(score) {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
        }
    }
};

saveSystem.load();
