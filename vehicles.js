const vehicles = {
    jeep: {
        name: "Jeep", power: 0.35, weight: 1.0, grip: 1.2, fuelUsage: 1.0, cost: 0,
        width: 120, height: 40, wheelRadius: 20, wheelOffset: 45, suspensionLength: 35,
        color: '#8B4513'
    },
    bike: {
        name: "Bike", power: 0.45, weight: 0.5, grip: 0.9, fuelUsage: 0.8, cost: 5000,
        width: 90, height: 25, wheelRadius: 18, wheelOffset: 35, suspensionLength: 25,
        color: '#FF0000'
    },
    monster: {
        name: "Monster Truck", power: 0.55, weight: 1.6, grip: 1.5, fuelUsage: 1.5, cost: 20000,
        width: 150, height: 60, wheelRadius: 35, wheelOffset: 60, suspensionLength: 50,
        color: '#00FF00'
    },
    bus: {
        name: "Bus", power: 0.30, weight: 2.5, grip: 1.4, fuelUsage: 2.0, cost: 50000,
        width: 200, height: 70, wheelRadius: 25, wheelOffset: 80, suspensionLength: 30,
        color: '#FFD700'
    },
    sports: {
        name: "Sports Car", power: 0.60, weight: 0.8, grip: 1.8, fuelUsage: 1.2, cost: 100000,
        width: 130, height: 30, wheelRadius: 18, wheelOffset: 50, suspensionLength: 20,
        color: '#0000FF'
    },
    formula1: {
        name: "Formula 1", power: 0.80, weight: 0.6, grip: 2.2, fuelUsage: 1.5, cost: 250000,
        width: 140, height: 25, wheelRadius: 16, wheelOffset: 55, suspensionLength: 15,
        color: '#FF0055'
    },
    hypercar: {
        name: "Hypercar", power: 1.00, weight: 0.7, grip: 2.5, fuelUsage: 1.6, cost: 500000,
        width: 135, height: 28, wheelRadius: 19, wheelOffset: 52, suspensionLength: 18,
        color: '#8A2BE2'
    }
};

const upgradesInfo = {
    engine: { name: "Engine", baseCost: 1000, valuePerLevel: 0.02 },
    suspension: { name: "Suspension", baseCost: 1000, valuePerLevel: 0.02 }, // Increases stiffness/reduces bounce
    grip: { name: "Grip", baseCost: 1000, valuePerLevel: 0.05 },
    fuel: { name: "Fuel Tank", baseCost: 1000, valuePerLevel: 0.1 } // Percentage multiplier
};
