console.log('index.js');
/*=================GAME LOGIC===================*/
let MATRIX_SIZE = 4;
const EMPTY_TILE = '';
let RIGHT_ORDER = makeMatrix(MATRIX_SIZE * MATRIX_SIZE);
let matrixCurState = [];
let isPaused = false;
let time = 0;
let steps = 0;
let allowSounds = false;
let existSavedGame = localStorage.hasOwnProperty('lastGame');
let existFinishedGames = localStorage.hasOwnProperty('results');
const winSound = new Audio('./styles/sounds/winMusic.mp3');
const whooshSound = new Audio('./styles/sounds/whoosh.mp3');
const ooupsSound = new Audio('./styles/sounds/oou.mp3');

const getRandomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

function makeMatrix(n) {
    const array = [];
    for (let i = 1; i < n; i++) {
        array.push(i.toString());
    }
    array.push(EMPTY_TILE);

    const matrix = [];
    const matrixSize = Math.sqrt(n);

    for (let i = 0; i < matrixSize; i++) {
        matrix.push(array.slice(i * matrixSize, i * matrixSize + matrixSize))
    }

    return matrix;
}

const findCoordinates = (matrix, value) => {
    // console.log('findCoordinates', matrix, value)
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === value) {
                return [i, j];
            }
        }
    }
    throw new Error(`${value} missing in the matrix`)
}

const swapElements = (matrix, a, b) => {
    // console.log('swapElements', matrix, a, b)
    const
        x1 = a[0],
        y1 = a[1],
        x2 = b[0],
        y2 = b[1];
    [matrix[x1][y1], matrix[x2][y2]] = [matrix[x2][y2], matrix[x1][y1]]
}

const shuffleMatrix = (matrix) => {
    console.log(MATRIX_SIZE, 'shuffleMatrix MATRIX_SIZE')
    for (let i = 0; i < 2; i++) {
        // for (let i = 0; i < MATRIX_SIZE*25; i++) {
        const emptyElCoord = findCoordinates(matrix, EMPTY_TILE);
        const chooseRandomCoord = getRandomNum(0, 2);
        const isExtremeEl = (emptyElCoord[chooseRandomCoord] === 0 || emptyElCoord[chooseRandomCoord] === MATRIX_SIZE - 1)
        const elToMoveCoord = emptyElCoord.slice();
        if (isExtremeEl && emptyElCoord[chooseRandomCoord] === 0) {
            emptyElCoord[chooseRandomCoord]++
        }
        if (isExtremeEl && emptyElCoord[chooseRandomCoord] === MATRIX_SIZE - 1) {
            emptyElCoord[chooseRandomCoord]--
        }
        if (!isExtremeEl) {
            emptyElCoord[chooseRandomCoord] = (getRandomNum(0, 2) === 1) ?
                emptyElCoord[chooseRandomCoord] + 1 :
                emptyElCoord[chooseRandomCoord] - 1;
        }
        swapElements(matrix, elToMoveCoord, emptyElCoord)
    }
    matrixCurState = matrix;
    return matrix;
}

const compareCoordinates = (a, b) => {
    const
        x1 = a[0],
        y1 = a[1],
        x2 = b[0],
        y2 = b[1];
    if ((x1 === x2 && (Math.abs(y1 - y2) === 1)) || (y1 === y2 && (Math.abs(x1 - x2) === 1))) {
        return true
    }
    console.log('forbidden, curElCoordinates:', b)
    return false
}

const tryToMove = (matrix, curEl) => {
    const emptyElCoordinates = findCoordinates(matrix, EMPTY_TILE)
    const curElCoordinates = findCoordinates(matrix, curEl);
    if (compareCoordinates(emptyElCoordinates, curElCoordinates)) {
        steps++;
        setSteps(steps);
        swapElements(matrix, curElCoordinates, emptyElCoordinates);
        matrixCurState = matrix;

        console.log('can move, curElCoordinates:', curElCoordinates)
        return true;
    }
    return false
}

function checkIfGameOver(matrix) {
    return JSON.stringify(matrix) === JSON.stringify(RIGHT_ORDER);
}

/*=================DRAW PUZZLE===================*/

function createElement(tag, ...classes) {
    const node = document.createElement(tag);
    node.classList.add(...classes);
    return node;
}

function drawWrapper() {
    const body = document.querySelector('body')
    const wrapper = createElement('div', 'wrapper');
    body.append(wrapper)
}

function highlightWrongElement(curEl) {
    const items = document.querySelectorAll('.item');
    const curItem = Array.from(items).find(el => el.textContent === curEl);
    curItem.classList.add('warning')
    setTimeout(function () {
        curItem.classList.remove('warning')
    }, 100)
}

function drawMatrix(matrix) {
    console.log('drawMatrix');
    console.log('matrix', matrix)
    if (document.querySelector('.squares-container')) {
        document.querySelector('.squares-container').remove();
    }
    const node = document.querySelector('.time-score-row')
    const squaresContainer = createElement('div', 'squares-container');

    matrix.forEach(matrixRow => {
        const row = createElement('div', 'row');
        squaresContainer.append(row);
        matrixRow.forEach(el => {
            // console.log('el', el);
            const tile = createElement('div', 'item');
            if (el === EMPTY_TILE) {

                tile.classList.add('empty-tile');
            }
            tile.textContent = el;
            row.append(tile)
        })
    })
    node.after(squaresContainer)
}

/*===================BUTTONS=====================*/

function createButton(name, listener, ...classes) {
    const button = createElement('button', ...classes);
    button.innerText = name;
    button.addEventListener('click', listener)
    return button;
}

function addButtons() {
    const wrapper = document.querySelector('.wrapper');
    const buttonsRow = createElement('div', 'buttons-row');
    const restartBtn = createButton('restart', restartGame, 'button', 'button-restart')
    const pauseBtn = createButton('pause', pauseGame, 'button', 'button-pause')
    const saveBtn = createButton('save', saveGame, 'button', 'button-save')
    const resultBtn = createButton('result', showGameResults, 'button', 'button-result')
    const soundIcon = createElement('span', 'icon', 'icon-sound', 'icon-sound_off');
    soundIcon.addEventListener('click', switchMusic)
    buttonsRow.append(restartBtn, pauseBtn, saveBtn, resultBtn, soundIcon);

    wrapper.append(buttonsRow);
}

/*===================Time & Score=====================*/

function setSteps(steps) {
    const stepsContainer = document.querySelector('.score-steps');
    stepsContainer.innerHTML = steps;
}

function startTimer() {
    isPaused = false
}

function pauseTimer() {
    isPaused = true
}

function timeIncrease() {
    if (!isPaused) {
        time++;
        setTime(time);
    }
}

function setTime(value) {
    const seconds = (value % 60).toString();
    const minutes = Math.trunc(value / 60).toString();
    const timer = document.querySelector('.timer');
    const timeInMins = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    timer.innerHTML = timeInMins;
    return timeInMins;
}

function addTimeScore() {
    const wrapper = document.querySelector('.wrapper');
    const timeScoreRow = createElement('div', 'time-score-row');
//SCORE
    const scoreContainer = createElement('div', 'score-container');
    const scoreTitle = createElement('span', 'score-title');
    const scoreSteps = createElement('span', 'score-steps');
    scoreTitle.textContent = `Moves: `;
    scoreSteps.textContent = steps;
    scoreContainer.append(scoreTitle, scoreSteps);
//TIMER
    const timerContainer = createElement('div', 'timer-container');
    const timeTitle = createElement('span', 'time-title');
    const timer = createElement('span', 'timer');
    timeTitle.textContent = `Time: `;
    timer.textContent = '00:00';
    timerContainer.append(timeTitle, timer);

    timeScoreRow.append(scoreContainer, timerContainer);
    wrapper.append(timeScoreRow);
}

/*===================Puzzle sizes=====================*/

function addSizeOptions() {
    const wrapper = document.querySelector('.wrapper');
    const sizeOptionsContainer = createElement('div', 'matrix-sizes-container');
    const sizeDescription = createElement('p', 'matrix-sizes-description');
    sizeDescription.textContent = 'You can choose another size of puzzle:'

    const sizeOptionsRow = createElement('div', 'matrix-sizes-row');
    for (let i = 3; i <= 8; i++) {
        const button = createElement('button', 'button', 'small-btn', `btn-size-${i}`)
        button.textContent = `${i}*${i}`
        button.addEventListener('click', matrixChangeSize)
        sizeOptionsRow.append(button);
    }
    sizeOptionsContainer.append(sizeDescription, sizeOptionsRow)
    wrapper.append(sizeOptionsContainer)
}

/*=================CONTROLLER===================*/
const addTileClickHandler = (matrix) => {
    const tiles = document.querySelectorAll('.item');
    tiles.forEach(el => el.addEventListener('click', (e) => {
            const value = e.target.innerText;
            const moveSuccessful = tryToMove(matrix, value);
            if (moveSuccessful) {
                if (allowSounds) {
                    whooshSound.play();
                }
                document.querySelector('.squares-container').remove();
                drawMatrix(matrix);
                addTileClickHandler(matrix);
            } else {
                if (allowSounds) {
                    ooupsSound.play();
                }
                highlightWrongElement(value);
            }
            if (checkIfGameOver(matrix)) finishGame();
        })
    )
}

function setMatrixSize(value = 4) {
    MATRIX_SIZE = value;
}


function startGame() {
    setMatrixSize(4);
    const matrix = makeMatrix(MATRIX_SIZE * MATRIX_SIZE);
    shuffleMatrix(matrix);
    drawWrapper();
    addButtons();
    if (existSavedGame) drawSaveGameBtn();
    if (existFinishedGames) drawClearResultsBtn();
    addTimeScore();
    drawMatrix(matrix);

    const overlay = makeModalWindow('To start the game, choose its size')
    document.querySelector('.squares-container').prepend(overlay)
    pauseTimer();

    addSizeOptions();
    addTileClickHandler(matrix);
    setInterval(timeIncrease, 1000);

}

startGame()

function restartGame() {
    console.log('restartGame')

    const matrix = makeMatrix(MATRIX_SIZE * MATRIX_SIZE);
    console.log(matrix, 'restart matrix')
    shuffleMatrix(matrix);
    drawMatrix(matrix);
    addTileClickHandler(matrix);
    startTimer();
    isPaused = false;
    document.querySelector('.score-steps').textContent = 0;
    document.querySelector('.timer').textContent = '00:00';
    time = 0;
    steps = 0;
    matrixCurState = [];
}

function matrixChangeSize(e) {
    console.log('restartGameChangeSize')
    e.preventDefault();
    console.log(e.target.innerText.slice(-1), 'e.target.innerText.slice(-1)')
    const matrixSize = e.target.innerText.slice(-1);
    setMatrixSize(matrixSize);
    RIGHT_ORDER = makeMatrix(matrixSize * matrixSize)
    restartGame();
}

function pauseGame() {
    console.log('pauseGame')
    if (isPaused) return;
    pauseTimer();
    const continueBtn = createButton('continue', continueGame, 'button', 'continue-button');
    const overlay = makeModalWindow('You stopped the game, to continue press the button:', continueBtn)
    document.querySelector('.squares-container').prepend(overlay)
}

function continueGame() {
    console.log('continueGame')
    const overlay = document.querySelector('.overlay');
    overlay.remove();
    startTimer();
}

function saveResults() {
    console.log('saveResults')
    const date = new Date();
    const wonGame = {size: MATRIX_SIZE, moves: steps, timer: time, date: date.toLocaleDateString()}

    if (localStorage.hasOwnProperty('results')) {
        const results = Array.from(JSON.parse(localStorage.results));
        results.push(wonGame);
        localStorage.setItem('results', JSON.stringify(results))
    } else {
        localStorage.setItem('results', JSON.stringify([wonGame]))
    }

}

function finishGame() {
    console.log('finishGame')
    pauseTimer();
    if (allowSounds) {
        winSound.play();
    }
    const overlay = makeModalWindow(`Hooray! You solved the puzzle in ${setTime(time)} and ${steps} moves!`)
    document.querySelector('.squares-container').prepend(overlay)
    saveResults();
}

function returnUnfinishedGame() {
    console.log('returnUnfinishedGame');
    console.log(JSON.parse(localStorage.lastGame), 'JSON.parse(localStorage.lastGame)')
    const lastGame = JSON.parse(localStorage.lastGame);
    matrixCurState = lastGame.matrix;
    time = lastGame.timer;
    steps = lastGame.moves;
    document.querySelector('.squares-container').remove();
    drawMatrix(matrixCurState);
    addTileClickHandler(matrixCurState);
    startTimer();
    setSteps(steps);
    document.querySelector('.button-unfinished').remove();
    localStorage.removeItem('lastGame')
    // const btnLastGame = document.querySelector('.button-unfinished');
}

function clearResults() {
    localStorage.removeItem('results')
    document.querySelector('.button-clear-results').remove();
}

function drawClearResultsBtn() {
    const btnClearGameResults = createButton('clear results', clearResults, 'button', 'button-clear-results')
    const resultsBtn = document.querySelector('.button-result');
    resultsBtn.after(btnClearGameResults);
}

function drawSaveGameBtn() {
    const btnLastGame = createButton('continue saved game', returnUnfinishedGame, 'button', 'button-unfinished')
    const saveBtn = document.querySelector('.button-save');
    saveBtn.after(btnLastGame);
}

function saveGame() {
    console.log('saveGame')
    pauseTimer();
    const lastGame = {matrix: matrixCurState, moves: steps, timer: time}
    console.log(JSON.stringify(lastGame), 'JSON.stringify(lastGame)')
    localStorage.setItem('lastGame', JSON.stringify(lastGame))
    drawSaveGameBtn();
}

function closeResultWindow() {
    document.querySelector('.overlay').remove()
    // startTimer();
}

function showGameResults() {
    console.log('showGameResults')
    // pausedTimer();
    const results = Array.from(JSON.parse(localStorage.results));
    const sortedArray = results.sort((a, b) => (b.size - a.size || b.moves.toString().localeCompare(a.moves.toString()))).slice(0, 10);
    const table = createElement('div', 'result-container')
    const tableHeader = createElement('div', 'table-row', 'table-header')
    const keys = Object.keys(results[0]);
    keys.forEach(el => {
        const headerItem = createElement('div', 'table-item');
        headerItem.textContent = el;
        tableHeader.append(headerItem)
    })
    table.append(tableHeader)

    for (let i = 0; i < sortedArray.length; i++) {
        const tableRow = createElement('div', 'table-row');
        for (let [key, value] of Object.entries(sortedArray[i])) {
            const tableItem = createElement('div', 'table-item');
            if (key === 'size') {
                tableItem.innerHTML = `${value} x ${value}`;
            } else if (key === 'timer') {
                tableItem.textContent = setTime(value);
            } else {
                tableItem.textContent = value;
            }

            tableRow.append(tableItem)
        }
        table.append(tableRow)
    }

    const closeBtn = createElement('span', 'close-button')
    closeBtn.addEventListener('click', closeResultWindow)

    console.log(table);
    const overlay = createElement('div', 'overlay');
    const modal = createElement('div', 'modal');
    modal.append(table)
    overlay.append(modal, closeBtn)

    document.querySelector('body').append(overlay)
}

function switchMusic() {
    const switcher = document.querySelector('.icon-sound');
    switcher.classList.toggle('icon-sound_on');
    switcher.classList.toggle('icon-sound_off');
    allowSounds = (!allowSounds);
}

function makeModalWindow(message, button) {
    const overlay = createElement('div', 'overlay');
    const modal = createElement('div', 'modal');
    const note = createElement('div', 'note');
    note.textContent = message;
    modal.append(note)
    if (button) {
        modal.append(button)
    }
    overlay.append(modal)
    return overlay;
}