const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const messageScreen = document.getElementById('messageScreen');
const messageText = document.getElementById('messageText');
const restartBtn = document.getElementById('restartBtn');
const player1ScoreDisplay = document.getElementById('player1Score');
const player2ScoreDisplay = document.getElementById('player2Score');
const difficultySelect = document.getElementById('difficulty');
const player1Input = document.getElementById('player1Name');
const player2Input = document.getElementById('player2Name');
const modeSelect = document.getElementById('modeSelect');
const resetScoreBtn = document.getElementById('resetScore');
const clickSound = document.getElementById('clickSound');

const bgMusic = document.getElementById('bgMusic');

let currentPlayer = 'X';
let gameActive = true;
let mode = 'ai';
let player1 = 'You';
let player2 = 'AI';
let player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
let player2Score = parseInt(localStorage.getItem('player2Score')) || 0;

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function startGame() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
    cell.addEventListener('click', handleClick, { once: true });
  });
  gameActive = true;
  currentPlayer = 'X';
  messageScreen.classList.remove('active');
  mode = modeSelect.value;
  player1 = player1Input.value.trim() || 'Player 1';
  player2 = player2Input.value.trim() || (mode === 'ai' ? 'AI' : 'Player 2');

  updateScores();
}

function updateScores() {
  player1ScoreDisplay.textContent = `${player1}: ${player1Score}`;
  player2ScoreDisplay.textContent = `${player2}: ${player2Score}`;
  localStorage.setItem('player1Score', player1Score);
  localStorage.setItem('player2Score', player2Score);
}

function handleClick(e) {
  const cell = e.target;
  if (!gameActive || cell.textContent !== '') return;

  clickSound.play();
  cell.textContent = currentPlayer;

  if (checkWin(currentPlayer)) {
    endGame(false, currentPlayer);
  } else if (isDraw()) {
    endGame(true);
  } else {
    if (mode === 'ai' && currentPlayer === 'X') {
      currentPlayer = 'O';
      setTimeout(aiMove, 400);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }
}

function aiMove() {
  const difficulty = difficultySelect.value;
  let move = difficulty === 'easy' ? getRandomMove() :
             difficulty === 'medium' ? getMediumMove() :
             getBestMove();

  if (move != null && gameActive) {
    cells[move].textContent = 'O';
    if (checkWin('O')) {
      endGame(false, 'O');
    } else if (isDraw()) {
      endGame(true);
    } else {
      currentPlayer = 'X';
    }
  }
}

function getEmptyCells() {
  return [...cells].map((c, i) => c.textContent === '' ? i : null).filter(i => i !== null);
}

function getRandomMove() {
  const empties = getEmptyCells();
  return empties[Math.floor(Math.random() * empties.length)];
}

function getMediumMove() {
  for (let i of getEmptyCells()) {
    cells[i].textContent = 'O';
    if (checkWin('O')) { cells[i].textContent = ''; return i; }
    cells[i].textContent = '';
  }
  for (let i of getEmptyCells()) {
    cells[i].textContent = 'X';
    if (checkWin('X')) { cells[i].textContent = ''; return i; }
    cells[i].textContent = '';
  }
  return getRandomMove();
}

function getBestMove() {
  let bestScore = -Infinity, move;
  for (let i of getEmptyCells()) {
    cells[i].textContent = 'O';
    let score = minimax(cells, 0, false);
    cells[i].textContent = '';
    if (score > bestScore) { bestScore = score; move = i; }
  }
  return move;
}

function minimax(cells, depth, isMax) {
  if (checkWin('O')) return 10 - depth;
  if (checkWin('X')) return depth - 10;
  if (isDraw()) return 0;

  const empties = getEmptyCells();
  let best = isMax ? -Infinity : Infinity;

  for (let i of empties) {
    cells[i].textContent = isMax ? 'O' : 'X';
    let score = minimax(cells, depth + 1, !isMax);
    cells[i].textContent = '';
    best = isMax ? Math.max(score, best) : Math.min(score, best);
  }

  return best;
}

function checkWin(player) {
  return winCombos.some(combo => combo.every(i => cells[i].textContent === player));
}

function isDraw() {
  return [...cells].every(cell => cell.textContent !== '');
}

function endGame(draw, winner = null) {
  gameActive = false;
  if (draw) {
    messageText.textContent = "It's a Draw!";
  } else {
    const name = (winner === 'X') ? player1 : player2;
    messageText.textContent = `${name} Wins! 🎉`;
    if (winner === 'X') player1Score++;
    else player2Score++;
  }
  updateScores();
  messageScreen.classList.add('active');
}

restartBtn.addEventListener('click', startGame);
resetScoreBtn.addEventListener('click', () => {
  player1Score = 0;
  player2Score = 0;
  updateScores();
});

player1Input.addEventListener('input', () => {
  player1 = player1Input.value.trim() || 'Player 1';
  updateScores();
});
player2Input.addEventListener('input', () => {
  player2 = player2Input.value.trim() || (mode === 'ai' ? 'AI' : 'Player 2');
  updateScores();
});

modeSelect.addEventListener('change', () => {
  const isAI = modeSelect.value === 'ai';
  difficultySelect.style.display = isAI ? 'inline-block' : 'none';
  player2Input.placeholder = isAI ? "AI Name" : "Player 2 Name";
  startGame();
});

startGame();