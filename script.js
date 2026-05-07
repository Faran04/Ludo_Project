let COLORS = [];
let teamMode = false;

const TEAMS = {
  red: "team1",
  yellow: "team1",
  green: "team2",
  blue: "team2",
};


const COLOR_NAMES = {
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  blue: "Blue",
};

function startGame(count) {
  teamMode = false;

  if (count === 2) {
    COLORS = ["red", "yellow"];
  } else {
    COLORS = ["red", "green", "yellow", "blue"];
  }

  playerPage.classList.add("hidden");
  gamePage.classList.remove("hidden");

  buildBoard();
  state = createInitialState();

  setMessage('Click “Roll Dice” to start.');
  render();
}
function startTeamGame() {
  teamMode = true;

  COLORS = ["red", "green", "yellow", "blue"];

  playerPage.classList.add("hidden");
  gamePage.classList.remove("hidden");

  buildBoard();
  state = createInitialState();

  setMessage("Team Play started. Red and Yellow are together. Green and Blue are together.");
  render();
}
const PATH = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
];

const START_INDEX = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

const ENTRY_INDEX = {
  red: 50,
  green: 11,
  yellow: 24,
  blue: 37,
};

const HOME_PATHS = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

const YARDS = {
  red: [[1.8, 1.8], [1.8, 4.2], [4.2, 1.8], [4.2, 4.2]],
  green: [[1.8, 9.8], [1.8, 12.2], [4.2, 9.8], [4.2, 12.2]],
  yellow: [[9.8, 9.8], [9.8, 12.2], [12.2, 9.8], [12.2, 12.2]],
  blue: [[9.8, 1.8], [9.8, 4.2], [12.2, 1.8], [12.2, 4.2]],
};

const SAFE_CELLS = new Set([
  coordKey(PATH[START_INDEX.red]),
  coordKey(PATH[START_INDEX.green]),
  coordKey(PATH[START_INDEX.yellow]),
  coordKey(PATH[START_INDEX.blue]),
]);

const board = document.getElementById("board");
const rollBtn = document.getElementById("rollBtn");
const restartBtn = document.getElementById("restartBtn");
const currentTurnEl = document.getElementById("currentTurn");
const diceValueEl = document.getElementById("diceValue");
const messageEl = document.getElementById("message");

const homePage = document.getElementById("home-page");
const playerPage = document.getElementById("player-page");
const gamePage = document.getElementById("game-page");
const continueBtn = document.getElementById("continueBtn");

continueBtn.addEventListener("click", () => {
  homePage.classList.add("hidden");
  playerPage.classList.remove("hidden");
});
let state;
let cells = {};

function coordKey([r, c]) {
  return `${r},${c}`;
}

function createInitialState() {
  return {
    currentPlayerIndex: 0,
    diceValue: null,
    canRoll: true,
    selectableTokens: [],
    winner: null,
    players: Object.fromEntries(
      COLORS.map((color) => [
        color,
        Array.from({ length: 4 }, (_, i) => ({
          id: `${color}-${i}`,
          color,
          state: "yard", // yard | track | home | finished
          steps: -1,
        })),
      ])
    ),
  };
}

function buildBoard() {
  board.innerHTML = "";
  cells = {};
  for (let r = 0; r < 15; r += 1) {
    for (let c = 0; c < 15; c += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      board.appendChild(cell);
      cells[coordKey([r, c])] = cell;
    }
  }

  styleBoardCells();
  addYardDecorations();
}

function styleBoardCells() {
  const redYard = rectCells(0, 0, 6, 6);
  const greenYard = rectCells(0, 9, 6, 15);
  const blueYard = rectCells(9, 0, 15, 6);
  const yellowYard = rectCells(9, 9, 15, 15);

  redYard.forEach((key) => cells[key].classList.add("red-yard"));
  greenYard.forEach((key) => cells[key].classList.add("green-yard"));
  blueYard.forEach((key) => cells[key].classList.add("blue-yard"));
  yellowYard.forEach((key) => cells[key].classList.add("yellow-yard"));

  PATH.forEach((coord) => cells[coordKey(coord)].classList.add("track"));
  HOME_PATHS.red.forEach((coord) => cells[coordKey(coord)].classList.add("home-path", "red-path"));
  HOME_PATHS.green.forEach((coord) => cells[coordKey(coord)].classList.add("home-path", "green-path"));
  HOME_PATHS.yellow.forEach((coord) => cells[coordKey(coord)].classList.add("home-path", "yellow-path"));
  HOME_PATHS.blue.forEach((coord) => cells[coordKey(coord)].classList.add("home-path", "blue-path"));

  cells[coordKey(PATH[START_INDEX.red])].classList.add("start-cell", "start-red");
  cells[coordKey(PATH[START_INDEX.green])].classList.add("start-cell", "start-green");
  cells[coordKey(PATH[START_INDEX.yellow])].classList.add("start-cell", "start-yellow");
  cells[coordKey(PATH[START_INDEX.blue])].classList.add("start-cell", "start-blue");

  [[6,1],[1,8],[8,13],[13,6]].forEach((coord) => cells[coordKey(coord)].classList.add("safe-cell"));

  const centerCells = [[6,6],[6,7],[6,8],[7,6],[7,7],[7,8],[8,6],[8,7],[8,8]];
  centerCells.forEach((coord) => cells[coordKey(coord)].classList.add("center"));
}

function rectCells(r1, c1, r2, c2) {
  const result = [];
  for (let r = r1; r < r2; r += 1) {
    for (let c = c1; c < c2; c += 1) {
      result.push(coordKey([r, c]));
    }
  }
  return result;
}

function addYardDecorations() {
  const yardFrames = [
    { color: "red", left: 0.7, top: 0.7 },
    { color: "green", left: 9.3, top: 0.7 },
    { color: "blue", left: 0.7, top: 9.3 },
    { color: "yellow", left: 9.3, top: 9.3 },
  ];

  yardFrames.forEach(({ color, left, top }) => {
    const frame = document.createElement("div");
    frame.className = "yard-square";
    frame.style.left = `calc(${left} * var(--cell-size))`;
    frame.style.top = `calc(${top} * var(--cell-size))`;
    frame.style.width = `calc(5 * var(--cell-size))`;
    frame.style.height = `calc(5 * var(--cell-size))`;
    board.appendChild(frame);

    YARDS[color].forEach(([r, c]) => {
      const slot = document.createElement("div");
      slot.className = "token-slot";
      slot.style.left = `calc(${c} * var(--cell-size) - var(--cell-size) * 0.06)`;
      slot.style.top = `calc(${r} * var(--cell-size) - var(--cell-size) * 0.06)`;
      board.appendChild(slot);
    });
  });
}

function render() {
  board.querySelectorAll(".token").forEach((el) => el.remove());

  COLORS.forEach((color) => {
    state.players[color].forEach((token, index) => {
      const tokenEl = document.createElement("button");
      tokenEl.className = `token ${color}`;
      tokenEl.textContent = index + 1;
      tokenEl.dataset.tokenId = token.id;
      if (state.selectableTokens.includes(token.id)) {
        tokenEl.classList.add("selectable");
      }
      if (token.state === "finished") {
        tokenEl.classList.add("finished");
      }

      const { row, col, stackIndex } = getTokenRenderPosition(token);
      tokenEl.style.left = `calc(${col} * var(--cell-size) + var(--cell-size) * 0.14 + ${stackOffset(stackIndex).x}px)`;
      tokenEl.style.top = `calc(${row} * var(--cell-size) + var(--cell-size) * 0.14 + ${stackOffset(stackIndex).y}px)`;
      tokenEl.addEventListener("click", () => onTokenClick(token.id));
      board.appendChild(tokenEl);
    });
  });

  const currentColor = COLORS[state.currentPlayerIndex];
  currentTurnEl.textContent = COLOR_NAMES[currentColor];
  diceValueEl.textContent = state.diceValue ?? "-";
  rollBtn.disabled = !state.canRoll || Boolean(state.winner);
}

function stackOffset(index) {
  const offsets = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
    { x: 10, y: 10 },
  ];
  return offsets[index % offsets.length];
}

function getTokenRenderPosition(token) {
  if (token.state === "yard") {
    const tokenNumber = Number(token.id.split("-")[1]);
    const [row, col] = YARDS[token.color][tokenNumber];
    return { row, col, stackIndex: tokenNumber };
  }

  if (token.state === "track") {
    const coord = PATH[(START_INDEX[token.color] + token.steps) % PATH.length];
    return {
      row: coord[0],
      col: coord[1],
      stackIndex: getStackIndex(token, coord),
    };
  }

  if (token.state === "home") {
    const coord = HOME_PATHS[token.color][token.steps - 51];
    return {
      row: coord[0],
      col: coord[1],
      stackIndex: getStackIndex(token, coord),
    };
  }

  return { row: 7, col: 7, stackIndex: Number(token.id.split("-")[1]) };
}

function getStackIndex(token, coord) {
  const key = coordKey(coord);
  const colocated = [];

  COLORS.forEach((color) => {
    state.players[color].forEach((other) => {
      if (other.state === "track") {
        const otherCoord = PATH[(START_INDEX[other.color] + other.steps) % PATH.length];
        if (coordKey(otherCoord) === key) colocated.push(other.id);
      } else if (other.state === "home") {
        const otherCoord = HOME_PATHS[other.color][other.steps - 51];
        if (coordKey(otherCoord) === key) colocated.push(other.id);
      }
    });
  });

  return colocated.sort().indexOf(token.id);
}

function getCurrentColor() {
  return COLORS[state.currentPlayerIndex];
}

function setMessage(text) {
  messageEl.textContent = text;
}

function rollDice() {
  if (!state.canRoll || state.winner) return;

  state.diceValue = Math.floor(Math.random() * 6) + 1;
  state.canRoll = false;
  const color = getCurrentColor();
  const movable = getMovableTokens(color, state.diceValue);
  state.selectableTokens = movable.map((token) => token.id);

  if (movable.length === 0) {
    setMessage(`${COLOR_NAMES[color]} rolled ${state.diceValue}. No valid move.`);
    finishTurn(state.diceValue === 6);
    return;
  }

  setMessage(`${COLOR_NAMES[color]} rolled ${state.diceValue}. Select a token to move.`);
  render();
}

function getMovableTokens(color, dice) {
  return state.players[color].filter((token) => canMoveToken(token, dice));
}

function canMoveToken(token, dice) {
  if (token.state === "finished") return false;
  if (token.state === "yard") return dice === 6;

  const targetSteps = token.steps + dice;
  return targetSteps <= 56;
}

function onTokenClick(tokenId) {
  if (!state.selectableTokens.includes(tokenId) || state.winner) return;

  const color = getCurrentColor();
  const token = state.players[color].find((item) => item.id === tokenId);
  if (!token) return;

  moveToken(token, state.diceValue);
  state.selectableTokens = [];

if (teamMode) {
  const winningTeam = checkTeamWinner(color);

  if (winningTeam) {
    state.winner = winningTeam;

    if (winningTeam === "team1") {
      setMessage("Team 1 wins! Red and Yellow finished all their tokens.");
    } else {
      setMessage("Team 2 wins! Green and Blue finished all their tokens.");
    }

    render();
    return;
  }
} else {
  if (checkWinner(color)) {
    state.winner = color;
    setMessage(`${COLOR_NAMES[color]} wins the game!`);
    render();
    return;
  }
}

  const extraTurn = state.diceValue === 6;
  finishTurn(extraTurn);
}

function moveToken(token, dice) {
  const color = token.color;

  if (token.state === "yard") {
    token.state = "track";
    token.steps = 0;
  } else {
    token.steps += dice;
    if (token.steps === 56) {
      token.state = "finished";
      setMessage(`${COLOR_NAMES[color]} moved a token to the center!`);
      render();
      return;
    }
    if (token.steps >= 51) {
      token.state = "home";
    }
  }

  captureIfNeeded(token);
  const landing = describeLanding(token);
  setMessage(`${COLOR_NAMES[color]} moved token ${Number(token.id.split("-")[1]) + 1}${landing}.`);
  render();
}

function describeLanding(token) {
  if (token.state === "finished") return " and finished it";
  if (token.state === "home") return " into the home path";
  const coord = PATH[(START_INDEX[token.color] + token.steps) % PATH.length];
  if (SAFE_CELLS.has(coordKey(coord))) return " onto a safe cell";
  return "";
}

function captureIfNeeded(movedToken) {
  if (movedToken.state !== "track") return;

  const coord = PATH[(START_INDEX[movedToken.color] + movedToken.steps) % PATH.length];
  const key = coordKey(coord);

  if (SAFE_CELLS.has(key)) return;

  COLORS.forEach((color) => {
    if (color === movedToken.color) return;

    // In team mode, teammates cannot capture each other
    if (teamMode && TEAMS[color] === TEAMS[movedToken.color]) {
      return;
    }

    state.players[color].forEach((token) => {
      if (token.state !== "track") return;

      const tokenCoord = PATH[(START_INDEX[token.color] + token.steps) % PATH.length];

      if (coordKey(tokenCoord) === key) {
        token.state = "yard";
        token.steps = -1;
        setMessage(`${COLOR_NAMES[movedToken.color]} captured a ${COLOR_NAMES[color]} token!`);
      }
    });
  });
}
function finishTurn(extraTurn) {
  state.diceValue = null;
  state.selectableTokens = [];
  state.canRoll = true;
  if (!extraTurn) {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % COLORS.length;
  } else {
    setMessage(`${COLOR_NAMES[getCurrentColor()]} gets another turn for rolling a 6.`);
  }
  render();
}

function checkWinner(color) {
  return state.players[color].every((token) => token.state === "finished");
}
function checkTeamWinner(color) {
  const team = TEAMS[color];

  const teamColors = COLORS.filter((playerColor) => TEAMS[playerColor] === team);

  const allFinished = teamColors.every((playerColor) =>
    state.players[playerColor].every((token) => token.state === "finished")
  );

  return allFinished ? team : null;
}
function restartGame() {
  state = createInitialState();
  setMessage('Click “Roll Dice” to start.');
  render();
}

rollBtn.addEventListener("click", rollDice);
restartBtn.addEventListener("click", restartGame);

//buildBoard();
//wait for player selection
