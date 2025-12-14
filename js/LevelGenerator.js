import { Brick } from './Brick.js';

export class LevelGenerator {
    constructor(game) {
        this.game = game;
        // Basic config
        this.brickWidth = 60;
        this.brickHeight = 25;
        this.padding = 10;
        this.marginTop = 80;
    }

    generate(level) {
        const bricks = [];

        // Calculate grid size
        const cols = Math.floor(this.game.width / (this.brickWidth + this.padding));
        const startX = (this.game.width - (cols * (this.brickWidth + this.padding))) / 2;

        // Increase rows with level, capped at say 10
        const rows = Math.min(3 + Math.floor(level / 2), 12);

        // Choose generation pattern based on level
        const patternType = level % 4; // 0: Solid, 1: Checker, 2: Random, 3: Symmetry

        // Base color HSL rotation
        const hue = (level * 40) % 360;

        for (let r = 0; r < rows; r++) {
            // Gradient color per row
            const color = `hsl(${hue}, 100%, ${50 + (r * 5)}%)`;

            for (let c = 0; c < cols; c++) {
                let createBrick = false;

                if (patternType === 0) {
                    createBrick = true;
                } else if (patternType === 1) {
                    createBrick = (r + c) % 2 === 0;
                } else if (patternType === 2) {
                    createBrick = Math.random() > 0.3;
                } else if (patternType === 3) {
                    // Symmetrical pattern vertical center
                    if (c < cols / 2) {
                        createBrick = Math.random() > 0.4;
                    } else {
                        // Mirror the first half ? Needs storage, simpler: active based on math
                        // For now let's just do a simpler alternating column
                        createBrick = c % 2 === 0;
                    }
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
