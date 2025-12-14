import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';
import { LevelGenerator } from './LevelGenerator.js';
import { PowerUp } from './PowerUp.js';
import { ParticleSystem } from './Particle.js';
import { SoundManager } from './SoundManager.js';

export class Game {
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
        // We now need an array of balls
        this.balls = [new Ball(this)];
        this.bricks = [];
        this.powerUps = [];
        this.powerUps = [];
        this.particles = new ParticleSystem();
        this.levelGenerator = new LevelGenerator(this);
        this.soundManager = new SoundManager();

        this.setupInput();
    }

    setupInput() {
        // Will implement input handling here (Mouse/Keyboard/Touch)
        window.addEventListener('mousemove', (e) => {
            if (this.isRunning && !this.isPaused) {
                // Adjust for canvas position if needed, but here canvas is full screen
                this.paddle.moveTo(e.clientX);
            }
        });

        // Touch support
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
        this.balls = [new Ball(this)]; // Reset to 1 ball
        this.balls[0].reset();
        this.powerUps = [];
        this.bricks = this.levelGenerator.generate(this.level);
        this.paddle.width = 150; // Reset paddle size
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    startNextLevel() {
        this.level++;
        this.updateUI();
        this.balls.forEach(b => b.reset()); // Reset all active balls or just 1? usually reset to 1
        this.balls = [new Ball(this)];
        this.balls[0].reset();
        this.powerUps = [];
        this.bricks = this.levelGenerator.generate(this.level);
        // Slightly speed up ball
        this.balls[0].speedMax = Math.min(15, 8 + this.level * 0.5);
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.updateUI();
        this.start();
    }

    updateUI() {
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('level-display').textContent = this.level;
    }

    stop() {
        this.isRunning = false;
        document.getElementById('game-over-screen').classList.add('active');
        document.getElementById('final-score').textContent = this.score;
    }

    spawnPowerUp(x, y) {
        if (Math.random() > 0.8) { // 20% chance
            const types = ['multi-ball', 'large-paddle', 'fire-ball'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new PowerUp(x, y, type));
        }
    }

    activatePowerUp(p) {
        if (p.type === 'multi-ball') {
            // Spawn 2 more balls
            this.balls.push(new Ball(this));
            this.balls.push(new Ball(this));
            // Initialize positions relative to paddle/screen center if active
            let lastBall = this.balls[0]; // Simplification, ideally copy active ball
            // if lastBall is not active or exists, safe fallback needed but array check above
            if (this.balls.length >= 3) {
                // The newly added are at end
                let b1 = this.balls[this.balls.length - 1];
                let b2 = this.balls[this.balls.length - 2];
                b1.x = lastBall.x; b1.y = lastBall.y; b1.speedX = -lastBall.speedX; b1.speedY = lastBall.speedY;
                b2.x = lastBall.x; b2.y = lastBall.y; b2.speedX = 0; b2.speedY = lastBall.speedY;
            }
        } else if (p.type === 'large-paddle') {
            this.paddle.width = Math.min(300, this.paddle.width + 50);
        } else if (p.type === 'fire-ball') {
            // Set all active balls to fire status
            this.balls.forEach(b => b.isFire = true);
            // Visual change handled in ball draw? Need to update Ball class or handle here
            // Just assume property is checked in collision
        }
    }

    update(deltaTime) {
        this.paddle.update(deltaTime);
        this.particles.update();

        // Filter out inactive balls
        this.balls = this.balls.filter(b => b.active);
        if (this.balls.length === 0) {
            this.stop();
            return;
        }

        this.balls.forEach(ball => {
            ball.update(deltaTime);

            // Ball-Paddle Collision
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

            // Ball-Brick Collision
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

        // PowerUps update
        this.powerUps.forEach(p => {
            p.update();
            // Check collision with paddle
            if (p.active && this.checkCollisionRect(p, this.paddle)) {
                p.active = false;
                this.activatePowerUp(p);
                this.soundManager.playPowerUp();
            }
            // Remove if out of screen
            if (p.y > this.height) p.active = false;
        });

        // Clean inactive entities
        this.powerUps = this.powerUps.filter(p => p.active);

        // Active bricks check
        let activeBricksCount = 0;
        this.bricks.forEach(b => { if (b.active) activeBricksCount++; });

        if (activeBricksCount === 0) {
            this.startNextLevel();
            return;
        }
    }

    checkCollision(ball, rect) {
        // Simple AABB collision detection adjusted for circle ball
        // Closest point on validation
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
        // Clear screen
        this.ctx.fillStyle = '#0b0b14'; // Background color clear
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.particles.draw(this.ctx); // Draw particles behind paddle/ball? or on top? On top usually.
        this.bricks.forEach(b => b.draw(this.ctx));
        this.powerUps.forEach(p => p.draw(this.ctx));
        this.paddle.draw(this.ctx);
        this.balls.forEach(b => {
            // Draw fire effect if active?
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
