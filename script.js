const gameArea = document.querySelector('.game-area');
const playerPaddle = document.getElementById('playerPaddle');
const cpuPaddle = document.getElementById('cpuPaddle');
const ball = document.getElementById('ball');
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');

const game = {
  width: gameArea.clientWidth,
  height: gameArea.clientHeight,
  paddleHeight: 110,
  paddleWidth: 14,
  ballSize: 18,
  playerY: (gameArea.clientHeight - 110) / 2,
  cpuY: (gameArea.clientHeight - 110) / 2,
  ballX: gameArea.clientWidth / 2,
  ballY: gameArea.clientHeight / 2,
  ballSpeedX: 6,
  ballSpeedY: 4,
  playerScore: 0,
  cpuScore: 0,
  keys: {
    ArrowUp: false,
    ArrowDown: false,
  },
  mouseY: null,
};

function updatePaddlePositions() {
  playerPaddle.style.top = `${game.playerY}px`;
  playerPaddle.style.left = '20px';

  cpuPaddle.style.top = `${game.cpuY}px`;
  cpuPaddle.style.right = '20px';
}

function updateBallPosition() {
  ball.style.left = `${game.ballX}px`;
  ball.style.top = `${game.ballY}px`;
}

function resetBall(direction = 1) {
  game.ballX = game.width / 2 - game.ballSize / 2;
  game.ballY = game.height / 2 - game.ballSize / 2;
  const angle = (Math.random() * 1.2 - 0.6); // between -0.6 and 0.6 radians
  const speed = 6;
  game.ballSpeedX = direction * speed * Math.cos(angle || 0.5);
  game.ballSpeedY = speed * Math.sin(angle || 0.5);
  updateBallPosition();
}

function updateScore() {
  playerScoreEl.textContent = game.playerScore;
  cpuScoreEl.textContent = game.cpuScore;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function handlePlayerInput() {
  if (game.keys.ArrowUp) {
    game.playerY -= 8;
  }
  if (game.keys.ArrowDown) {
    game.playerY += 8;
  }

  if (game.mouseY !== null) {
    game.playerY = game.mouseY - game.paddleHeight / 2;
  }

  game.playerY = clamp(game.playerY, 0, game.height - game.paddleHeight);
  updatePaddlePositions();
}

function updateComputer() {
  const targetY = game.ballY - game.paddleHeight / 2;
  const cpuSpeed = 4.8;

  if (game.ballX > game.width / 2) {
    if (game.cpuY < targetY) {
      game.cpuY += cpuSpeed;
    } else if (game.cpuY > targetY) {
      game.cpuY -= cpuSpeed;
    }
  }

  game.cpuY = clamp(game.cpuY, 0, game.height - game.paddleHeight);
  updatePaddlePositions();
}

function detectWallCollision() {
  if (game.ballY <= 0 || game.ballY + game.ballSize >= game.height) {
    game.ballSpeedY *= -1;
    game.ballY = clamp(game.ballY, 0, game.height - game.ballSize);
  }
}

function detectPaddleCollision() {
  const playerX = 20;
  const cpuX = game.width - 20 - game.paddleWidth;

  const ballLeft = game.ballX;
  const ballRight = game.ballX + game.ballSize;
  const ballTop = game.ballY;
  const ballBottom = game.ballY + game.ballSize;

  const playerTop = game.playerY;
  const playerBottom = game.playerY + game.paddleHeight;
  const cpuTop = game.cpuY;
  const cpuBottom = game.cpuY + game.paddleHeight;

  if (
    ballRight >= playerX &&
    ballLeft <= playerX + game.paddleWidth &&
    ballBottom >= playerTop &&
    ballTop <= playerBottom &&
    game.ballSpeedX < 0
  ) {
    const relativeIntersectY = (game.ballY + game.ballSize / 2) - (game.playerY + game.paddleHeight / 2);
    const normalized = relativeIntersectY / (game.paddleHeight / 2);
    const bounceAngle = normalized * (Math.PI / 3);
    const speed = Math.hypot(game.ballSpeedX, game.ballSpeedY) + 0.3;

    game.ballSpeedX = speed * Math.cos(bounceAngle);
    game.ballSpeedY = speed * Math.sin(bounceAngle);
    game.ballX = playerX + game.paddleWidth;
  }

  if (
    ballLeft <= cpuX + game.paddleWidth &&
    ballRight >= cpuX &&
    ballBottom >= cpuTop &&
    ballTop <= cpuBottom &&
    game.ballSpeedX > 0
  ) {
    const relativeIntersectY = (game.ballY + game.ballSize / 2) - (game.cpuY + game.paddleHeight / 2);
    const normalized = relativeIntersectY / (game.paddleHeight / 2);
    const bounceAngle = normalized * (Math.PI / 3);
    const speed = Math.hypot(game.ballSpeedX, game.ballSpeedY) + 0.3;

    game.ballSpeedX = -speed * Math.cos(bounceAngle);
    game.ballSpeedY = speed * Math.sin(bounceAngle);
    game.ballX = cpuX - game.ballSize;
  }
}

function detectScoring() {
  if (game.ballX < 0) {
    game.cpuScore += 1;
    updateScore();
    resetBall(1);
  }

  if (game.ballX + game.ballSize > game.width) {
    game.playerScore += 1;
    updateScore();
    resetBall(-1);
  }
}

function gameLoop() {
  handlePlayerInput();
  updateComputer();

  game.ballX += game.ballSpeedX;
  game.ballY += game.ballSpeedY;

  detectWallCollision();
  detectPaddleCollision();
  detectScoring();

  updateBallPosition();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (event.key in game.keys) {
    game.keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in game.keys) {
    game.keys[event.key] = false;
  }
});

gameArea.addEventListener('mousemove', (event) => {
  const rect = gameArea.getBoundingClientRect();
  game.mouseY = event.clientY - rect.top;
});

updatePaddlePositions();
updateBallPosition();
updateScore();
resetBall(1);
requestAnimationFrame(gameLoop);
