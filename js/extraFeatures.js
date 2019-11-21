var HINTS = "💡";
var normalFace = "😊";
var loseFace = "🥺";
var winFace = "😎";
var heart='💓'


function smileyFace(type) {
    if (type === "reset") return initGame(lastGameStartType);
    smiley = document.querySelector(".smiley");
    smiley.innerHTML = type;
  }

  
  

function showHints() {
    elHint = document.querySelector(".hints");
    strHTML = "";
    for (let i = 0; i < gHintCnt; i++) {
      strHTML += `${HINTS}`;
    }
    elHint.innerHTML = strHTML;
    
  }
  function hintGiver() {
    if (!isGameOn) return;
    if (!gHintCnt) return;
    var randomi = getRndInteger(0, gBoard.length - 1);
    var randomj = getRndInteger(0, gBoard.length - 1);
    firstLocation = { i: randomi, j: randomj };
    neighborChecker(firstLocation);
    renderBoard(gBoard);
    gHintCnt--;
    showHints();
    setTimeout(() => {
      firstLocation = { i: randomi, j: randomj };
      deleteHint(firstLocation);
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
  
  function showhearts(){
    var elHearts=document.querySelector('.lives')
    strHTML = "";
    for (let i = 0; i < gLives+1; i++) {
      strHTML += `${heart}`;
    }
    elHearts.innerHTML = strHTML;
    
  }