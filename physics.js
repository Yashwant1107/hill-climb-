const gravity = 0.4;

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function smoothFollow(current, target, factor) {
    return current + (target - current) * factor;
}

function mapVal(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function normalizeAngle(angle) {
    // Keep angle between -PI and PI
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}
