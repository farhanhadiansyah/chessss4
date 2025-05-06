const board = document.getElementById("board");
const whiteTimerEl = document.getElementById("white-timer");
const blackTimerEl = document.getElementById("black-timer");
const restartBtn = document.getElementById("restart-btn");

let position = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

let selected = null;
let possibleMoves = [];
let whiteTurn = true;

let whiteTime = 300, blackTime = 300;
let timerInterval = setInterval(updateTimer, 1000);

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimer() {
  if (whiteTurn) whiteTime--;
  else blackTime--;

  whiteTimerEl.textContent = `Putih: ${formatTime(whiteTime)}`;
  blackTimerEl.textContent = `Hitam: ${formatTime(blackTime)}`;

  if (whiteTime <= 0) {
    clearInterval(timerInterval);
    alert("Waktu habis! Hitam menang.");
  } else if (blackTime <= 0) {
    clearInterval(timerInterval);
    alert("Waktu habis! Putih menang.");
  }
}

restartBtn.addEventListener("click", () => {
  location.reload();
});

function renderBoard() {
  board.innerHTML = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const square = document.createElement("div");
      square.className = "square " + ((x + y) % 2 === 0 ? "light" : "dark");
      square.dataset.x = x;
      square.dataset.y = y;

      const piece = position[y][x];
      if (piece) square.innerHTML = pieces[piece];

      if (possibleMoves.some(m => m[0] === x && m[1] === y)) {
        const dot = document.createElement("div");
        dot.style.width = "16px";
        dot.style.height = "16px";
        dot.style.borderRadius = "50%";
        dot.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
        square.appendChild(dot);
      }

      square.addEventListener("click", handleClick);
      board.appendChild(square);
    }
  }

  checkVictory();
}

function handleClick(e) {
  const x = +e.currentTarget.dataset.x;
  const y = +e.currentTarget.dataset.y;

  if (selected) {
    const [sx, sy] = selected;
    const piece = position[sy][sx];
    const target = position[y][x];
    const isWhite = piece === piece.toUpperCase();
    const isCurrentPlayer = (isWhite && whiteTurn) || (!isWhite && !whiteTurn);

    if (!isCurrentPlayer) {
      alert("Sekarang bukan giliran kamu.");
      return;
    }

    if (possibleMoves.some(m => m[0] === x && m[1] === y)) {
      position[y][x] = piece;
      position[sy][sx] = "";
      whiteTurn = !whiteTurn;
    }

    selected = null;
    possibleMoves = [];
    renderBoard();
  } else if (position[y][x]) {
    const piece = position[y][x];
    const isWhite = piece === piece.toUpperCase();
    const isCurrentPlayer = (isWhite && whiteTurn) || (!isWhite && !whiteTurn);

    if (!isCurrentPlayer) {
      alert("Sekarang bukan giliran kamu.");
      return;
    }

    selected = [x, y];
    possibleMoves = getMoves(piece, x, y);
    renderBoard();
  }
}

function getMoves(piece, x, y) {
  const moves = [];
  const isWhite = piece === piece.toUpperCase();
  const dir = isWhite ? -1 : 1;

  const add = (dx, dy, repeat = false) => {
    let nx = x + dx, ny = y + dy;
    while (inBoard(nx, ny)) {
      const target = position[ny][nx];
      if (!target) {
        moves.push([nx, ny]);
      } else {
        if ((target === target.toUpperCase()) !== isWhite) {
          moves.push([nx, ny]);
        }
        break;
      }
      if (!repeat) break;
      nx += dx;
      ny += dy;
    }
  };

  switch (piece.toLowerCase()) {
    case "p":
      if (inBoard(x, y + dir) && position[y + dir][x] === "") {
        moves.push([x, y + dir]);
        if ((isWhite && y === 6) || (!isWhite && y === 1)) {
          if (position[y + 2 * dir][x] === "") {
            moves.push([x, y + 2 * dir]);
          }
        }
      }
      for (let dx of [-1, 1]) {
        const tx = x + dx, ty = y + dir;
        if (inBoard(tx, ty)) {
          const target = position[ty][tx];
          if (target && (target === target.toUpperCase()) !== isWhite) {
            moves.push([tx, ty]);
          }
        }
      }
      break;
    case "r": add(1, 0, true); add(-1, 0, true); add(0, 1, true); add(0, -1, true); break;
    case "b": add(1, 1, true); add(-1, 1, true); add(1, -1, true); add(-1, -1, true); break;
    case "q":
      add(1, 0, true); add(-1, 0, true); add(0, 1, true); add(0, -1, true);
      add(1, 1, true); add(-1, 1, true); add(1, -1, true); add(-1, -1, true);
      break;
    case "n":
      [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dx,dy])=>{
        const nx = x + dx, ny = y + dy;
        if (inBoard(nx, ny)) {
          const target = position[ny][nx];
          if (!target || (target === target.toUpperCase()) !== isWhite) {
            moves.push([nx, ny]);
          }
        }
      });
      break;
    case "k":
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (inBoard(nx, ny)) {
            const target = position[ny][nx];
            if (!target || (target === target.toUpperCase()) !== isWhite) {
              moves.push([nx, ny]);
            }
          }
        }
      }
      break;
  }
  return moves;
}

function inBoard(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function checkVictory() {
  let whiteLeft = false, blackLeft = false;
  for (let row of position) {
    for (let p of row) {
      if (p === p.toUpperCase()) whiteLeft = true;
      if (p === p.toLowerCase()) blackLeft = true;
    }
  }
  if (!whiteLeft) {
    clearInterval(timerInterval);
    alert("Hitam menang! Semua bidak putih habis.");
  } else if (!blackLeft) {
    clearInterval(timerInterval);
    alert("Putih menang! Semua bidak hitam habis.");
  }
}

renderBoard();