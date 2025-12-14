export class Ball {
    constructor(game) {
        this.game = game;
        this.radius = 8;
        this.reset();

        this.color = '#ffffff';
        this.speedMax = 8;

        // Trail
        this.trail = [];
        this.trailLimit = 10;
        this.isFire = false;
    }

    reset() {
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        this.speedX = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = -6; // Initial upward velocity
        this.active = true;
        this.isFire = false;
        this.trail = [];
    }

    update(deltaTime) {
        if (!this.active) return;

        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLimit) {
            this.trail.shift();
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.speedX *= -1;
        }
        if (this.x + this.radius > this.game.width) {
            this.x = this.game.width - this.radius;
            this.speedX *= -1;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.speedY *= -1;
        }

        // Bottom collision (Game Over condition handled in Game.js ideally, but checking here)
        if (this.y - this.radius > this.game.height) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw Trail
        for (let i = 0; i < this.trail.length; i++) {
            let point = this.trail[i];
            let alpha = i / this.trail.length; // 0 to 1
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius * (alpha * 0.8), 0, Math.PI * 2);
            ctx.fillStyle = this.isFire ? 'orange' : this.color;
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isFire ? '#ffaa00' : this.color;

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.isFire ? 'red' : this.color;

        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}
