# Bric-à-Balle

A modern, neon-styled infinite brick breaker game built with Vanilla JavaScript and HTML5 Canvas.

## 🎮 Play Now

Simply open `index.html` in your web browser to play locally, or host it on any static site provider like GitHub Pages.

## ✨ Features

- **Infinite Gameplay**: Procedurally generated levels that get harder as you progress.
- **Power-up System**:
  - 🟡 **Multi-Ball**: Spawns additional balls.
  - 🟢 **Large Paddle**: temporary increases paddle width.
  - 🔴 **Fire Ball**: cuts through bricks without bouncing.
- **Visual Polish**:
  - Neon glow aesthetics.
  - Particle system for explosions.
  - Smooth 60FPS animations.
  - Responsive design (Mouse & Touch support).

## 🛠️ Technical Details

- **Engine**: Custom-built game loop using `requestAnimationFrame`.
- **Physics**: AABB (Axis-Aligned Bounding Box) collision detection for bricks, Circle-Rectangle collision for the paddle.
- **Architecture**: Zero dependencies. Single-file architecture (`js/script.js`) for easy portability and local execution without CORS issues.

## 🚀 How to Run

1. Clone the repository.
2. Open `index.html`.
3. Click **JOUER** to start.

## 📝 License

Distributed under the MIT License.
