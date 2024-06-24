const cells = document.querySelectorAll('[data-cell]');
const restartButton = document.getElementById('restartButton');
const startBotButton = document.getElementById('startBot');
const winnerMessageElement = document.getElementById('winnerMessage');
const xWinsElement = document.getElementById('xWins');
const oWinsElement = document.getElementById('oWins');
const turnMessageElement = document.getElementById('turnMessage');
const statusBottom = document.getElementById('status-bottom');
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
let currentPlayer = 'X';
let moves = { X: [], O: [] };
let moveCount = { X: 0, O: 0 };
let gameActive = true;
let xWins = 0;
let oWins = 0;
let botEnabled = false;

function handleClick(e) {
    const cell = e.target;
    if (!gameActive || cell.textContent !== '') return;

    placeMark(cell, currentPlayer);

    if (checkWin(currentPlayer)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        handleMove(currentPlayer, cell);
        swapTurns();
        if (botEnabled && gameActive) {
            setTimeout(botMove, 500);
        }
    }
}

function handleMove(player, cell) {
    moveCount[player]++;
    moves[player].push(cell);

    if (moveCount[player] > 3) {
        const cellToClear = moves[player].shift();
        cellToClear.textContent = '';
        cellToClear.classList.remove(player, 'fade');
        cellToClear.addEventListener('click', handleClick, { once: true });
    }

    if (moveCount[player] >= 3) {
        moves[player][0].classList.add('fade');
    }
}

function placeMark(cell, currentClass) {
    cell.textContent = currentClass;
    cell.classList.remove('highlight');
    cell.classList.add(currentClass);
    cell.removeEventListener('click', handleClick);
}

function swapTurns() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setTurnMessage();
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cells[index].textContent === currentClass;
        });
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.textContent === 'X' || cell.textContent === 'O';
    });
}

function endGame(draw) {
    if (draw) {
        winnerMessageElement.textContent = 'Berabere!';
    } else {
        winnerMessageElement.textContent = `${currentPlayer} kazandı!`;
        if (currentPlayer === 'X') {
            xWins++;
            xWinsElement.textContent = xWins;
        } else {
            oWins++;
            oWinsElement.textContent = oWins;
        }
    }
    gameActive = false;
    turnMessageElement.style.display = 'none';
    winnerMessageElement.style.display = 'block';
}

function startGame() {
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('highlight', 'fade', 'X', 'O');
        cell.addEventListener('click', handleClick, { once: true });
    });
    winnerMessageElement.style.display = 'none';
    winnerMessageElement.textContent = '';
    moves = { X: [], O: [] };
    moveCount = { X: 0, O: 0 };
    gameActive = true;
    setTurnMessage();
    turnMessageElement.style.display = 'block';
}

function setTurnMessage() {
    turnMessageElement.textContent = `Hamle sırası: ${currentPlayer}`;
}

function botMove() {
    const emptyCells = Array.from(cells).filter(cell => cell.textContent === '');

    // Kazanma hamlesi kontrolü
    for (let combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        const cellA = cells[a];
        const cellB = cells[b];
        const cellC = cells[c];

        if (cellA.textContent === currentPlayer && cellB.textContent === currentPlayer && cellC.textContent === '') {
            placeMark(cellC, currentPlayer);
            return finalizeMove();
        }
        if (cellA.textContent === currentPlayer && cellC.textContent === currentPlayer && cellB.textContent === '') {
            placeMark(cellB, currentPlayer);
            return finalizeMove();
        }
        if (cellB.textContent === currentPlayer && cellC.textContent === currentPlayer && cellA.textContent === '') {
            placeMark(cellA, currentPlayer);
            return finalizeMove();
        }
    }

    // Oyuncunun kazanmasını engelleme kontrolü
    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    for (let combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        const cellA = cells[a];
        const cellB = cells[b];
        const cellC = cells[c];

        if (cellA.textContent === opponent && cellB.textContent === opponent && cellC.textContent === '') {
            placeMark(cellC, currentPlayer);
            return finalizeMove();
        }
        if (cellA.textContent === opponent && cellC.textContent === opponent && cellB.textContent === '') {
            placeMark(cellB, currentPlayer);
            return finalizeMove();
        }
        if (cellB.textContent === opponent && cellC.textContent === opponent && cellA.textContent === '') {
            placeMark(cellA, currentPlayer);
            return finalizeMove();
        }
    }

    // Merkezi kontrol et
    const centerCell = cells[4];
    if (centerCell.textContent === '') {
        placeMark(centerCell, currentPlayer);
        return finalizeMove();
    }

    // Köşeleri kontrol et
    const corners = [cells[0], cells[2], cells[6], cells[8]];
    for (let corner of corners) {
        if (corner.textContent === '') {
            placeMark(corner, currentPlayer);
            return finalizeMove();
        }
    }

    // Eğer tüm stratejik hamleler yapılmadıysa rastgele bir hamle yap
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[randomIndex];

    placeMark(cell, currentPlayer);
    finalizeMove();
}

function finalizeMove() {
    if (checkWin(currentPlayer)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
    }
}

startBotButton.addEventListener('click', () => {
    currentPlayer = 'X';
    botEnabled = true;
    startGame();
});

restartButton.addEventListener('click', startGame);

startGame();
