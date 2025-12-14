/**
 * Bric-à-Balle - Main Script
 * Combined file for file:// protocol compatibility
 */

// --- PRELOAD ASSETS ---
// (No external images currently, but good practice spot)

// --- CLASSES ---

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(frequency, type, duration, startTime = 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playBrickHit() {
        this.resume();
        this.playTone(800 + Math.random() * 200, 'sine', 0.1);
    }

    playPaddleHit() {
        this.resume();
        this.playTone(300, 'square', 0.1);
    }

    playPowerUp() {
        this.resume();
        this.playTone(440, 'sine', 0.1, 0);
        this.playTone(554.37, 'sine', 0.1, 0.05);
        this.playTone(659.25, 'sine', 0.2, 0.1);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.life = 1.0; // Opacity/Life
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.95; // Shrink
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

class Paddle {
    constructor(game) {
        this.game = game;
        this.width = 150;
        this.height = 20;
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - 50;
        this.speed = 0;
        this.maxSpeed = 10;

        this.color = '#00f3ff'; // Neon Blue
    }

    update(deltaTime) {
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
    }

    moveTo(x) {
        this.x = x - this.width / 2;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Ball {
    constructor(game) {
        this.game = game;
        this.radius = 8;
        this.reset();
        this.color = '#ffffff';
        this.speedMax = 8;
        this.trail = [];
        this.trailLimit = 10;
        this.isFire = false;
    }

    reset() {
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        this.speedX = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = -6;
        this.active = true;
        this.isFire = false;
        this.trail = [];
    }

    update(deltaTime) {
        if (!this.active) return;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLimit) {
            this.trail.shift();
        }

        this.x += this.speedX;
        this.y += this.speedY;

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

        if (this.y - this.radius > this.game.height) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        for (let i = 0; i < this.trail.length; i++) {
            let point = this.trail[i];
            let alpha = i / this.trail.length;
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
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.isFire ? 'red' : this.color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

class Brick {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 25;
        this.color = color;
        this.active = true;
        this.type = 'normal';
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4, 4);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, (this.height - 4) / 2, 4);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 15;
        this.speedY = 3;
        this.type = type;
        this.active = true;

        switch (this.type) {
            case 'multi-ball': this.color = '#ffff00'; break;
            case 'large-paddle': this.color = '#00ff00'; break;
            case 'fire-ball': this.color = '#ff4400'; break;
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
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

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

class LevelGenerator {
    constructor(game) {
        this.game = game;
        this.brickWidth = 60;
        this.brickHeight = 25;
        this.padding = 10;
        this.marginTop = 80;
    }

    generate(level) {
        const bricks = [];
        const cols = Math.floor(this.game.width / (this.brickWidth + this.padding));
        const startX = (this.game.width - (cols * (this.brickWidth + this.padding))) / 2;
        const rows = Math.min(3 + Math.floor(level / 2), 12);
        const patternType = level % 4;
        const hue = (level * 40) % 360;

        for (let r = 0; r < rows; r++) {
            const color = `hsl(${hue}, 100%, ${50 + (r * 5)}%)`;
            for (let c = 0; c < cols; c++) {
                let createBrick = false;
                if (patternType === 0) createBrick = true;
                else if (patternType === 1) createBrick = (r + c) % 2 === 0;
                else if (patternType === 2) createBrick = Math.random() > 0.3;
                else if (patternType === 3) {
                    if (c < cols / 2) createBrick = Math.random() > 0.4;
                    else createBrick = c % 2 === 0;
                }

                if (createBrick) {
                    const x = startX + c * (this.brickWidth + this.padding);
                    const y = this.marginTop + r * (this.brickHeight + this.padding);
                    bricks.push(new Brick(x, y, color));
                }
            }
        }
        return bricks;
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;

        this.level = 1;
        this.score = 0;

        this.paddle = new Paddle(this);
        this.balls = [new Ball(this)];
        this.bricks = [];
        this.powerUps = [];
        this.particles = new ParticleSystem();
        this.levelGenerator = new LevelGenerator(this);
        this.soundManager = new SoundManager();

        this.setupInput();
    }

    setupInput() {
        window.addEventListener('mousemove', (e) => {
            if (this.isRunning && !this.isPaused) {
                this.paddle.moveTo(e.clientX);
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.isRunning && !this.isPaused && e.touches.length > 0) {
                this.paddle.moveTo(e.touches[0].clientX);
            }
        }, { passive: true });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.paddle.y = this.height - 50;
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.balls = [new Ball(this)];
        this.balls[0].reset();
        this.powerUps = [];
        this.bricks = this.levelGenerator.generate(this.level);
        this.paddle.width = 150;
        this.balls[0].speedMax = Math.min(15, 8 + this.level * 0.5);
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));

        // Ensure UI is reset if needed
        this.updateUI();
    }

    startNextLevel() {
        this.level++;
        this.updateUI();
        this.balls.forEach(b => b.reset());
        this.balls = [new Ball(this)];
        this.balls[0].reset();
        this.powerUps = [];
        this.bricks = this.levelGenerator.generate(this.level);
        this.balls[0].speedMax = Math.min(15, 8 + this.level * 0.5);
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.updateUI();
        this.start();
    }

    updateUI() {
        const scoreEl = document.getElementById('score-display');
        const levelEl = document.getElementById('level-display');
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = this.level;
    }

    stop() {
        this.isRunning = false;
        document.getElementById('game-over-screen').classList.add('active');
        document.getElementById('final-score').textContent = this.score;
    }

    spawnPowerUp(x, y) {
        if (Math.random() > 0.8) {
            const types = ['multi-ball', 'large-paddle', 'fire-ball'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new PowerUp(x, y, type));
        }
    }

    activatePowerUp(p) {
        if (p.type === 'multi-ball') {
            this.balls.push(new Ball(this));
            this.balls.push(new Ball(this));
            let lastBall = this.balls[0];
            if (this.balls.length >= 3) {
                let b1 = this.balls[this.balls.length - 1];
                let b2 = this.balls[this.balls.length - 2];
                b1.x = lastBall.x; b1.y = lastBall.y; b1.speedX = -lastBall.speedX; b1.speedY = lastBall.speedY;
                b2.x = lastBall.x; b2.y = lastBall.y; b2.speedX = 0; b2.speedY = lastBall.speedY;
            }
        } else if (p.type === 'large-paddle') {
            this.paddle.width = Math.min(300, this.paddle.width + 50);
        } else if (p.type === 'fire-ball') {
            this.balls.forEach(b => b.isFire = true);
        }
    }

    update(deltaTime) {
        this.paddle.update(deltaTime);
        this.particles.update();

        this.balls = this.balls.filter(b => b.active);
        if (this.balls.length === 0) {
            this.stop();
            return;
        }

        this.balls.forEach(ball => {
            ball.update(deltaTime);

            if (this.checkCollision(ball, this.paddle)) {
                let collidePoint = ball.x - (this.paddle.x + this.paddle.width / 2);
                collidePoint = collidePoint / (this.paddle.width / 2);
                let angle = collidePoint * (Math.PI / 3);
                let speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
                if (speed < 6) speed = 6;
                ball.speedX = speed * Math.sin(angle);
                ball.speedY = -speed * Math.cos(angle);
                this.soundManager.playPaddleHit();
            }

            for (let i = 0; i < this.bricks.length; i++) {
                let b = this.bricks[i];
                if (!b.active) continue;

                if (this.checkCollision(ball, b)) {
                    b.active = false;
                    this.score += 10;
                    this.spawnPowerUp(b.x + b.width / 2, b.y + b.height / 2);
                    this.particles.emit(b.x + b.width / 2, b.y + b.height / 2, b.color, 15);
                    this.soundManager.playBrickHit();

                    if (!ball.isFire) {
                        ball.speedY *= -1;
                    }
                    this.updateUI();
                }
            }
        });

        this.powerUps.forEach(p => {
            p.update();
            if (p.active && this.checkCollisionRect(p, this.paddle)) {
                p.active = false;
                this.activatePowerUp(p);
                this.soundManager.playPowerUp();
            }
            if (p.y > this.height) p.active = false;
        });

        this.powerUps = this.powerUps.filter(p => p.active);

        let activeBricksCount = 0;
        this.bricks.forEach(b => { if (b.active) activeBricksCount++; });

        if (activeBricksCount === 0) {
            this.startNextLevel();
            return;
        }
    }

    checkCollision(ball, rect) {
        let distX = Math.abs(ball.x - rect.x - rect.width / 2);
        let distY = Math.abs(ball.y - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + ball.radius)) { return false; }
        if (distY > (rect.height / 2 + ball.radius)) { return false; }

        if (distX <= (rect.width / 2)) { return true; }
        if (distY <= (rect.height / 2)) { return true; }

        let dx = distX - rect.width / 2;
        let dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (ball.radius * ball.radius));
    }

    checkCollisionRect(r1, r2) {
        return (r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y);
    }

    draw() {
        this.ctx.fillStyle = '#0b0b14';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.particles.draw(this.ctx);
        this.bricks.forEach(b => b.draw(this.ctx));
        this.powerUps.forEach(p => p.draw(this.ctx));
        this.paddle.draw(this.ctx);
        this.balls.forEach(b => {
            if (b.isFire) {
                this.ctx.shadowColor = 'orange';
                this.ctx.shadowBlur = 20;
            }
            b.draw(this.ctx);
            this.ctx.shadowBlur = 0;
        });
    }

    gameLoop(timeStamp) {
        if (!this.isRunning) return;

        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (!this.isPaused) {
            this.update(deltaTime);
            this.draw();
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// --- INITIALIZATION ---

window.addEventListener('load', () => {
    console.log("Game Loaded");
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Canvas not found!");
        return;
    }

    const game = new Game(canvas);

    game.resize();
    window.addEventListener('resize', () => game.resize());

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log("Start Button Clicked");
            document.getElementById('start-screen').classList.remove('active');
            game.start();
        });
    } else {
        console.error("Start Button not found!");
    }

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            document.getElementById('game-over-screen').classList.remove('active');
            game.restart();
        });
    }
});
