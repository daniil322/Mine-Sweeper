var gBoard;
var boardType = {
  HARD: "hard",
  NORMAL: "normal",
  EASY: "easy"
};
var MINE = "💣";
var FLAG = "🚩";

var gMineCnt = 0;
var isGameOn = false;
var isGameOver = false;
var firstLocation;
var time = 0;
var timeElapsed;
var gFlaggedcnt = 0;
var initalMineCnt = 0;
var lastGameStartType;
var gHintCnt = 3;
var gLives = 3;
var mineHit;
var gameMoves = [];
var cellCount;
var noMinesNear = [];

function initGame(type) {
  restartGlobal(type);
  var size = chooseBoardSize(type);
  gBoard = createBoard(size);
  renderBoard(gBoard);
  initalMineCnt = gMineCnt;
  cellCount = size * size - gMineCnt;
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
      board[i][j] = {
        isMine: false,
        neighbors: "",
        marked: false,
        selected: false
      };
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
      if (board[i][j].selected === true) {
        classes += "selected";
      }
      strHTML += `<td class="${classes}" data-cellI=${i} data-cellJ=${j} onmousedown=checkCell(this,event)>`;
      if (board[i][j].marked === FLAG) {
        strHTML += board[i][j].marked;
      } else if (isGameOver === true && board[i][j].isMine === true) {
        strHTML += MINE;
      } else {
        strHTML += board[i][j].neighbors;
      }
      strHTML += "</td>";
    }
    strHTML += "</td>";
  }
  elBoard.innerHTML = strHTML;
}

function checkCell(ellCell, e) {
  var copyGBoard = copyBoard(gBoard);
  gameMoves.unshift({
    board: copyGBoard,
    lives: gLives,
    flagcnt: gFlaggedcnt,
    mineCount: gMineCnt
  });
  var i = +ellCell.dataset.celli;
  var j = +ellCell.dataset.cellj;
  if (mineHit || isGameOver === true || gBoard[i][j].neighbors !== "") {
    return;
  }

  if (hintMode) {
    return hintChoose(i, j);
  }

  if (!isGameOn) {
    isGameOn = true;
    if (!gManuallMode) {
      randomMines(gBoard, { i: i, j: j });
    }
    timeElapsed = setInterval(() => {
      time++;
      var elTime = document.querySelector(".time");
      elTime.innerHTML = time;
    }, 1000);
  }
  if (gManuallMode && !gManuallModestart) {
    initalMineCnt++;
    gMineCnt++;
    return (gBoard[i][j].isMine = true);
  }

  if (
    (gBoard[i][j].isMine === false && e.which === 3) ||
    (gBoard[i][j].isMine === true && e.which === 3)
  ) {
    markCell(i, j);
    return renderBoard(gBoard);
  }
  if (gBoard[i][j].isMine === true && e.which !== 3 && gLives === 1) {
    gLives--;
    gameOver("Loser");
    showHearts();
    return;
  }
  if (gBoard[i][j].isMine === true && e.which !== 3) {
    gLives--;
    mineHit = true;
    setTimeout(() => {
      mineHit = false;
    }, 2000);
    showHearts();
    return;
  }
  firstLocation = { i: i, j: j };
  neighborChecker(firstLocation);
  renderBoard(gBoard);
  openZeroNeighbors();
}

function markCell(i, j) {
  checkForwinner();
  var currcell = gBoard[i][j];
  if (currcell.marked === FLAG && currcell.isMine === true) {
    gMineCnt++;
    gFlaggedcnt--;
    return (currcell.marked = false);
  }
  if (currcell.marked === FLAG) {
    gFlaggedcnt--;
    return (currcell.marked = false);
  }
  if (currcell.isMine === true) {
    gMineCnt--;
    currcell.marked = FLAG;
    gFlaggedcnt++;
  }
  if (currcell.isMine === false && currcell.neighbors === "") {
    currcell.marked = FLAG;
    gFlaggedcnt++;
  }
  checkForwinner();
}

function gameOver(gameOverType) {
  switch (gameOverType) {
    case "Winner":
      smileyFace(winFace);
      break;
    case "Loser":
      smileyFace(loseFace);
      break;
  }
  isGameOn = false;
  isGameOver = true;
  document.querySelector(".gameOver").innerHTML = `You're a ${gameOverType}`;
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
      if (
        gBoard[i][j].isMine === false &&
        firstLocation === location &&
        gBoard[i][j].neighbors === ""
      ) {
        neighborChecker({ i: i, j: j });
      }
    }
  }
  if (
    location.j < 0 ||
    location.j > gBoard[0].length - 1 ||
    location.i < 0 ||
    location.i > gBoard.length - 1
  ) {
    return;
  }
  if (neighborcnt === 0) {
    noMinesNear.unshift(location);
  }
  if (gBoard[location.i][location.j].neighbors === "") {
    cellCount--;
  }
  gBoard[location.i][location.j].neighbors = neighborcnt;
  if (gBoard[location.i][location.j].marked === FLAG) {
    gFlaggedcnt--;
  }
  gBoard[location.i][location.j].marked = false;
  return neighborcnt;
}

function randomMines(gBoard, firstcell) {
  var minesToAdd = gMineCnt;
  for (let i = 0; i < minesToAdd; i++) {
    var randomi = getRndInteger(0, gBoard.length - 1);
    var randomj = getRndInteger(0, gBoard.length - 1);
    if (
      (randomi === firstcell.i && randomj === firstcell.j) ||
      gBoard[randomi][randomj].isMine === true
    ) {
      minesToAdd++;
      continue;
    }
    gBoard[randomi][randomj].isMine = true;
    minesToAdd += neighborCheckerForStart({ i: firstcell.i, j: firstcell.j });
  }
  return gBoard;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function neighborCheckerForStart(location) {
  var neighborcnt = 0;
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === location.i && j === location.j) continue;
      if (gBoard[i][j].isMine === true) neighborcnt++;
      gBoard[i][j].isMine = false;
    }
  }
  return neighborcnt;
}
