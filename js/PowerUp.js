export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 15;
        this.speedY = 3;
        this.type = type; // 'multi-ball', 'large-paddle', 'fire-ball'
        this.active = true;

        switch (this.type) {
            case 'multi-ball': this.color = '#ffff00'; break; // Yellow
            case 'large-paddle': this.color = '#00ff00'; break; // Green
            case 'fire-ball': this.color = '#ff4400'; break; // Orange Red
        }
    }

    update() {
        if (!this.active) return;
        this.y += this.speedY;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        // Pill shape
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // Icon or text inside?
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        let symbol = '';
        if (this.type === 'multi-ball') symbol = 'ooo';
        if (this.type === 'large-paddle') symbol = '<->';
        if (this.type === 'fire-ball') symbol = '!!!';

        ctx.fillText(symbol, this.x + this.width / 2, this.y + 11);

        ctx.shadowBlur = 0;
    }
}
