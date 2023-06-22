import readline from "readline";
import chalk from "chalk";
import clear from "clear";
import { getLetterAsNumber, getNumberAsLetter } from "./utils.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const GAME_SIZE = 3;
const PLAYER_A_SYMBOL = "X";
const PLAYER_B_SYMBOL = "O";
const QUIT_SYMBOL = "q";
let gameIsOver = false;
const board = Array(GAME_SIZE)
  .fill(null)
  .map(() => Array(GAME_SIZE).fill(" "));

function printHorizontalLine() {
  let line = "  +";
  for (let i = 0; i < GAME_SIZE; i++) {
    line += "---+";
  }
  console.log(line);
}

function printInstructions() {
  console.log(chalk.bold.italic.yellow("Tic Tac Toe @ June.so\n"));
  console.log(chalk.white("To quit, enter 'q' at any time."));
  console.log(
    chalk.white(
      "To make a move, enter the row and column of the cell you want to mark"
    )
  );
  console.log(
    chalk.white("For example, to mark the top-left cell, enter '1A'.\n")
  );
  console.log(chalk.blue('GAME IS OVER?', gameIsOver))
}

let currentPlayer = PLAYER_A_SYMBOL;
function printGame() {
  clear();
  printInstructions();
  let line = "   ";
  for (let i = 0; i < GAME_SIZE; i++) {
    line += ` ${getNumberAsLetter(i)}  `;
  }
  console.log(line);
  printHorizontalLine();
  board.forEach((row, rowIndex) => {
    console.log(
      `${rowIndex + 1} | ${row
        .map((cell) => {
          switch (cell) {
            case PLAYER_A_SYMBOL:
              return chalk.red(cell);
            case PLAYER_B_SYMBOL:
              return chalk.blue(cell);
            default:
              return " ";
          }
        })
        .join(" | ")} |`
    );
    printHorizontalLine();
  });
  console.log("\n");
}

function checkRows() {
  for (let i = 0; i < GAME_SIZE; i++) {
    // board[i][0] && board[i][1] ...
    if (board[i].every((cell) => cell === currentPlayer)) {
      return true;
    }
  }
  return false;
}

function checkColumns() {
  for (let i = 0; i < GAME_SIZE; i++) {
    // board[0][i] && board[1][i] ...
    if (board.every((row) => row[i] === currentPlayer)) {
      return true;
    }
  }
  return false;
}

function checkDiagonals() {
  // board[0][0] && board[1][1] ...
  if (board.every((row, index) => row[index] === currentPlayer)) {
    return true;
  }
  // board[0][2] && board[1][1] ...
  if (
    board.every((row, index) => row[GAME_SIZE - index - 1] === currentPlayer)
  ) {
    return true;
  }
  return false;
}

function printCurrentPlayerWithColor() {
  if (currentPlayer === PLAYER_A_SYMBOL) {
    return chalk.red(currentPlayer);
  } else {
    return chalk.blue(currentPlayer);
  }
}

function isGameWon() {
  return checkRows() || checkColumns() || checkDiagonals();
}

function isGameADraw() {
  return board.every((row) => row.every((cell) => cell !== " "));
}
function isMoveValid(row, col) {
  return (
    row >= 0 &&
    row <= GAME_SIZE - 1 &&
    col >= 0 &&
    col <= GAME_SIZE - 1 &&
    board[row][col] === " "
  );
}

function switchCurrentPlayer() {
  currentPlayer =
    currentPlayer === PLAYER_A_SYMBOL ? PLAYER_B_SYMBOL : PLAYER_A_SYMBOL;
}

async function checkGameStatus() {
  if (isGameWon()) {
    gameIsOver = true;
    printGame();
    console.log(`Player ${printCurrentPlayerWithColor()} wins!`);
    rl.close();
  } else if (isGameADraw()) {
    gameIsOver = true;
    printGame();
    console.log("It's a draw!");
    rl.close();
  } else {
    printGame();
    if (currentPlayer === PLAYER_A_SYMBOL) {
      await promptMove();
    }
  }
}

async function handlePlayerMove(row, col) {
  if (isMoveValid(row, col)) {
    board[row][col] = currentPlayer;
    switchCurrentPlayer();
    await checkGameStatus();
  } else {
    console.log("Invalid move. Please try again.");
    await promptMove();
  }
}

async function readInput() {
  const input = await new Promise(resolve => rl.question(
    `Player ${printCurrentPlayerWithColor()}, enter your move: `, resolve)
  );
  console.log("\n")
  if (input === QUIT_SYMBOL) {
    rl.close();
    return;
  }
  let [row, col] = input.split("");
  if (!row || !col) {
    console.log("Invalid move. Please try again.");
    await promptMove();
    return;
  }
  row = parseInt(row) - 1;
  col = getLetterAsNumber(col);
  return [row, col];
}
function getRandomInt() {
  return Math.floor(Math.random() * GAME_SIZE);
}

async function handleComputerMove() {
  let row = null;
  let col = null;
  for (let i = 0; i < GAME_SIZE; i++) {
    const numOtherPlayerPieces = [];
    const numMyPieces = [];
    const numEmptyPieces = [];
    board[i].forEach((e, index) => {
      if (e === PLAYER_A_SYMBOL) {
        numOtherPlayerPieces.push(index);
      } else if (e === PLAYER_B_SYMBOL) {
        numMyPieces.push(index);
      } else {
        numEmptyPieces.push(index);
      }
    });
    if (numOtherPlayerPieces.length > 1 && numEmptyPieces.length > 0) {
      row = i;
      col = numEmptyPieces[Math.floor(Math.random()*numEmptyPieces.length)];
    }
  }
  if (row === null || col === null) {
    row = getRandomInt();
    col = getRandomInt();
    let isValidMove = isMoveValid(row, col);
    while (!isValidMove) {
      row = getRandomInt();
      col = getRandomInt();
      isValidMove = isMoveValid(row, col);
    }
  }
  await handlePlayerMove(row, col);
}
async function promptMove() {
  const [row, col] = await readInput();
  await handlePlayerMove(row, col);
  if (!gameIsOver) {
    await handleComputerMove();
  }
}

(async () => {
  printGame();
  await promptMove();
})();
