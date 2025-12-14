export class Paddle {
    constructor(game) {
        this.game = game;
        this.width = 150;
        this.height = 20;
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - 50;
        this.speed = 0;
        this.maxSpeed = 10; // For keyboard control

        this.color = '#00f3ff'; // Neon Blue
    }

    update(deltaTime) {
        // Validation to keep paddle within screen
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
    }

    // Direct position update for mouse/touch
    moveTo(x) {
        this.x = x - this.width / 2;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Rounded rectangle logic
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // Reset shadow to avoid affecting other elements too much if not handled
        ctx.shadowBlur = 0;
    }
}
