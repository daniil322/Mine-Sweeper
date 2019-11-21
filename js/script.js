var gBoard;
var boardType = {
  HARD: "hard",
  NORMAL: "normal",
  EASY: "easy"
};
var MINE = "💣";
var FLAG = "🚩";

var gMineCnt;
var isGameOn = false;
var isGameOver = false;
var firstLocation;
var time = 0;
var timeElapsed;
var gFlaggedcnt = 0;
var initalMineCnt;
var lastGameStartType;
var gHintCnt = 3;
var gLives = 2;
var minehit;

function initGame(type) {
  showhearts();
  gLives = 2;
  gHintCnt = 3;
  showHints();
  smileyFace(normalFace);
  lastGameStartType = type;
  gFlaggedcnt = 0;
  document.querySelector(".bestTime").innerHTML =
    "Best Time=" + localStorage.getItem(type) + " Seconds";
  document.querySelector(".gameOver").innerHTML = "";
  clearInterval(timeElapsed);
  isGameOn = false;
  isGameOver = false;
  time = 0;
  var size = chooseBoardSize(type);
  initalMineCnt = gMineCnt;
  gBoard = createBoard(size);
  renderBoard(gBoard);
}

function chooseBoardSize(type) {
  var boardSize;
  switch (type) {
    case boardType.EASY:
      boardSize = 4;
      gMineCnt = 2;
      break;
    case boardType.NORMAL:
      boardSize = 8;
      gMineCnt = 12;
      break;
    case boardType.HARD:
      boardSize = 12;
      gMineCnt = 30;
  }
  return boardSize;
}

function createBoard(boardSize) {
  var board = [];
  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      board[i][j] = { isMine: false, neighbors: "", marked: false };
    }
  }
  return board;
}

function renderBoard(board) {
  var elBoard = document.querySelector(".board");

  var strHTML = "";
  for (let i = 0; i < board.length; i++) {
    strHTML += '<tr class="row">';
    for (let j = 0; j < board[i].length; j++) {
      var classes = "cell ";
      if (board[i][j].isMine === true) classes += "bomb";
      strHTML += `<td class="${classes}" data-cellI=${i} data-cellJ=${j} onmousedown=checkCell(this,event)>`;
      if (board[i][j].marked === FLAG) strHTML += board[i][j].marked;
      else if (isGameOver === true && board[i][j].isMine === true)
        strHTML += MINE;
      else strHTML += board[i][j].neighbors;
      strHTML += "</td>";
    }
    strHTML += "</td>";
  }
  elBoard.innerHTML = strHTML;
}

function checkCell(ellCell, e) {
  if (minehit) return;
  if (isGameOver === true) return;
  var i = +ellCell.dataset.celli;
  var j = +ellCell.dataset.cellj;

  if (!isGameOn) {
    isGameOn = true;
    randomMines(gBoard, { i: i, j: j });
    timeElapsed = setInterval(() => {
      time++;
      var elTime = document.querySelector(".time");
      elTime.innerHTML = time;
    }, 1000);
  }

  if (
    (gBoard[i][j].neighbors === "" && e.which === 3) ||
    (gBoard[i][j].isMine === true && e.which === 3)
  ) {
    markCell(i, j);
    return renderBoard(gBoard);
  }
  if (gBoard[i][j].isMine === true && e.which !== 3 && gLives === 0) {
    gameOver("Loser");
    gLives--;
    showhearts();
    return;
  }
  if (gBoard[i][j].isMine === true && e.which !== 3) {
    gLives--;
    minehit = true;
    setTimeout(() => {
      minehit = false;
    }, 2000);
    showhearts();
    return;
  }
  firstLocation = { i: i, j: j };
  neighborChecker(firstLocation);
  renderBoard(gBoard);
}

function markCell(i, j) {
  if (gBoard[i][j].marked === FLAG && gBoard[i][j].isMine === true) {
    gMineCnt++;
    gFlaggedcnt--;
    return (gBoard[i][j].marked = false);
  }
  if (gBoard[i][j].marked === FLAG) {
    gFlaggedcnt--;
    return (gBoard[i][j].marked = false);
  }
  if (gBoard[i][j].isMine === true) {
    gMineCnt--;
    gBoard[i][j].marked = FLAG;
    gFlaggedcnt++;
  }
  if (gMineCnt === 0 && gFlaggedcnt === initalMineCnt) {
    if (localStorage.getItem(lastGameStartType) === null)
      localStorage.setItem(lastGameStartType, count);
    if (count < localStorage.getItem(lastGameStartType))
      localStorage.setItem(lastGameStartType, count);
    return gameOver("Winner");
  }
}

function gameOver(type) {
  switch (type) {
    case "Winner":
      smileyFace(winFace);
      break;
    case "Loser":
      smileyFace(loseFace);
      break;
  }
  isGameOn = false;
  isGameOver = true;
  document.querySelector(".gameOver").innerHTML = `You're a ${type}`;
  clearInterval(timeElapsed);
  renderBoard(gBoard);
}

function neighborChecker(location) {
  var neighborcnt = 0;
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === location.i && j === location.j) continue;
      if (gBoard[i][j].isMine === true) neighborcnt++;
      if (gBoard[i][j].isMine === false && firstLocation === location) {
        neighborChecker({ i: i, j: j });
      }
    }
  }
  gBoard[location.i][location.j].neighbors = neighborcnt;

  if (gBoard[location.i][location.j].marked === FLAG) gFlaggedcnt--;
  gBoard[location.i][location.j].marked = false;
  return neighborcnt;
}

function randomMines(gBoard, firstcell) {
  count = gMineCnt;
  for (let i = 0; i < count; i++) {
    var randomi = getRndInteger(0, gBoard.length - 1);
    var randomj = getRndInteger(0, gBoard.length - 1);
    if (randomi === firstcell.i && randomj === firstcell.j) {
      count++;
      continue;
    }
    gBoard[randomi][randomj].isMine = true;
  }
  return gBoard;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
