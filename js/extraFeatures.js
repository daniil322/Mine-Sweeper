var HINTS = "💡";
var normalFace = "😊";
var loseFace = "🥺";
var winFace = "😎";
var heart = "💓";
var gSafeClickLeft = 3;
var gManuallMode = false;
var gManuallModestart = false;
var hintMode = false;
var hintTimeout;

function smileyFace(gameOverType) {
  if (gameOverType === "reset") return initGame(lastGameStartType);
  smiley = document.querySelector(".smiley");
  smiley.innerHTML = gameOverType;
}

function showHints() {
  elHint = document.querySelector(".hints");
  strHTML = "";
  for (let i = 0; i < gHintCnt; i++) {
    strHTML += `${HINTS}`;
  }
  elHint.innerHTML = strHTML;
}
function hintGiver(i, j) {
  if (!isGameOn) return;
  if (!gHintCnt) return;
  if (hintMode == true) hintMode = false;
  hintMode = true;
  document.querySelector(".hintMode").innerHTML = "Hint Mode Activated";
  return gBoard;
}
function hintChoose(i, j) {
  firstLocation = { i: i, j: j };
  document.querySelector(".hintMode").innerHTML = "";
  neighborChecker(firstLocation);
  renderBoard(gBoard);
  gHintCnt--;
  showHints();
  hintTimeout = setTimeout(() => {
    hintMode = false;
    firstLocation = { i: i, j: j };
    undoMove();
    renderBoard(gBoard);
  }, 1000);

  return gBoard;
}

function deleteHint(location) {
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === location.i && j === location.j) continue;
      if (gBoard[i][j].isMine === false && firstLocation === location) {
        deleteHint({ i: i, j: j });
      }
    }
  }
  gBoard[location.i][location.j].neighbors = "";
}

function showHearts() {
  var elHearts = document.querySelector(".lives");
  strHTML = "";
  for (let i = 0; i < gLives; i++) {
    strHTML += `${heart}`;
  }
  elHearts.innerHTML = strHTML;
}

function safeClick() {
  elSafeClick = document.querySelector(".safeClick");
  elSafeClick.innerHTML = "Safe Clicks Left: " + gSafeClickLeft;
  if (!isGameOn) return;
  if (!gSafeClickLeft) return;
  var randomi = getRndInteger(0, gBoard.length - 1);
  var randomj = getRndInteger(0, gBoard.length - 1);
  if (
    gBoard[randomi][randomj].isMine === false &&
    gBoard[randomi][randomj].neighbors === ""
  ) {
    gBoard[randomi][randomj].selected = true;
    renderBoard(gBoard);
    gSafeClickLeft--;
    elSafeClick.innerHTML = "Safe Clicks Left: " + gSafeClickLeft;
  }
  setTimeout(() => {
    gBoard[randomi][randomj].selected = false;
    renderBoard(gBoard);
  }, 1000);
  return gBoard;
}

function manuallyPositionedMines() {
  if (!gManuallMode) {
    initGame(lastGameStartType);
    gMineCnt = 0;
    initalMineCnt = 0;
  }
  if (gManuallMode) {
    document.querySelector(".manualMode").innerHTML = "";
    if (gManuallModestart) {
      startManuallMode();
    }
    initGame(lastGameStartType);
    return (gManuallMode = false);
  }
  gManuallMode = true;
  document.querySelector(".manualMode").innerHTML = "Manual Mode is turned on ";
}
function startManuallMode() {
  if (!gManuallMode) return;
  if (gManuallModestart) {
    document.querySelector(".startManualMode").innerHTML = "";
    return (gManuallModestart = false);
  }
  document.querySelector(".startManualMode").innerHTML =
    "You can start Playing Manual Mode";
  gManuallModestart = true;
}

function undoMove() {
  if (gameMoves.length === 0) return;
  gBoard = gameMoves[0].board;
  gLives = gameMoves[0].lives;
  gFlaggedcnt = gameMoves[0].flagcnt;
  gMineCnt = gameMoves[0].mineCount;
  showHearts();
  renderBoard(gBoard);
  gameMoves.splice(0, 1);
}

function copyBoard(board) {
  if (isGameOver === true) {
    isGameOn = true;
    isGameOver = false;
  }
  var copyBoard = [];
  for (let i = 0; i < board.length; i++) {
    copyBoard[i] = [];
    for (let j = 0; j < board[i].length; j++) {
      copyBoard[i][j] = { ...board[i][j] };
    }
  }
  return copyBoard;
}

function restartGlobal(type) {
  document.querySelector(".safeClick").innerHTML =
    "Safe Clicks Left: " + gSafeClickLeft;
  showHearts();
  gSafeClickLeft = 3;
  gLives = 3;
  gHintCnt = 3;
  showHints();
  smileyFace(normalFace);
  lastGameStartType = type;
  gFlaggedcnt = 0;
  if (localStorage.getItem(type) === null) {
    document.querySelector(".bestTime").innerHTML = "No Best Time Yet";
  }
  if (localStorage.getItem(type) !== null) {
    document.querySelector(".bestTime").innerHTML =
      "Best Time=" + localStorage.getItem(type) + " " + type + " Mode";
  }
  document.querySelector(".gameOver").innerHTML = "";
  clearInterval(timeElapsed);
  isGameOn = false;
  isGameOver = false;
  time = 0;
}
function checkForwinner() {
  if (gMineCnt === 0 && gFlaggedcnt === initalMineCnt && !cellCount) {
    if (localStorage.getItem(lastGameStartType) === null)
      localStorage.setItem(lastGameStartType, time);
    if (time < localStorage.getItem(lastGameStartType))
      localStorage.setItem(lastGameStartType, time);
    return gameOver("Winner");
  }
}

function openZeroNeighbors() {
  var noMineCnt = noMinesNear.length;
  noMinesNear.forEach(function(noMine) {
    firstLocation = noMine;
    neighborChecker(noMine);
    noMinesNear.shift(0, 1);
    renderBoard(gBoard);
  });
  if (noMineCnt !== noMinesNear.length) {
    openZeroNeighbors();
  }
}
