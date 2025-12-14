import { Game } from './Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);

    // Initial Resize
    game.resize();

    // Resize Listener
    window.addEventListener('resize', () => game.resize());

    // UI Buttons
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.remove('active');
        game.start();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.remove('active');
        game.restart();
    });
});
