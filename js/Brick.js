export class Brick {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 60; // Standard width, might be dynamic later
        this.height = 25;
        this.color = color;
        this.active = true;
        this.type = 'normal'; // 'normal', 'hard', 'unbreakable'
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        // Slightly rounded corners
        ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4, 4);
        ctx.fill();

        // Inner highlight for glass effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, (this.height - 4) / 2, 4);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
