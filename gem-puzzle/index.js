console.log('index.js');
/*=================GAME LOGIC===================*/
let MATRIX_SIZE = 4;
const EMPTY_TILE = '';
let RIGHT_ORDER = makeMatrix(MATRIX_SIZE*MATRIX_SIZE );
let isPaused = false;
let time = 0;
let steps = 0;

// class Matrix {
//     constructor(size, ) {
//         this.MATRIX_SIZE = size;
//         this.EMPTY_TILE = '';
//         this.time = 0;
//         this.steps = 0;
//     }
// }

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
    for (let i = 0; i < 100; i++) {
        const emptyElCoord = findCoordinates(matrix, EMPTY_TILE);
        const chooseRandomCoord = getRandomNum(0, 2);
        const isExtremeEl = (emptyElCoord[chooseRandomCoord] === 0 || emptyElCoord[chooseRandomCoord] === MATRIX_SIZE-1 )
        const elToMoveCoord = emptyElCoord.slice();
        if (isExtremeEl && emptyElCoord[chooseRandomCoord] === 0) {
            emptyElCoord[chooseRandomCoord]++
        }
        if (isExtremeEl && emptyElCoord[chooseRandomCoord] === MATRIX_SIZE-1) {
            emptyElCoord[chooseRandomCoord]--
        }
        if (!isExtremeEl) {
            emptyElCoord[chooseRandomCoord] = (getRandomNum(0, 2) === 1) ?
                emptyElCoord[chooseRandomCoord] + 1:
                emptyElCoord[chooseRandomCoord] - 1;
        }
        swapElements(matrix, elToMoveCoord , emptyElCoord)
    }
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
        if (checkIfGameOver(matrix)) return finishGame();
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
    console.log('matrix',matrix)
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

function createButton(tag, listener,  ...classes) {
    const button = createElement('button', ...classes);
    button.innerText = tag;
    button.addEventListener('click', listener)
    return button;
}

function addButtons() {
    const wrapper = document.querySelector('.wrapper');
    const buttonsRow = createElement('div', 'buttons-row');
    const resrartBtn = createButton('restart', restartGame, 'button', 'button-restart')
    const pauseBtn = createButton('pause', pauseGame, 'button', 'button-pause')
    const saveBtn = createButton('save', saveGame, 'button', 'button-save')
    const resultBtn = createButton('result', showGameResults, 'button', 'button-result')
    buttonsRow.append(resrartBtn, pauseBtn, saveBtn, resultBtn);

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

function pausedTimer() {
    isPaused = true
}

function timeIncrease() {
    if(!isPaused) {
        time++;
        setTime(time);
    }

}

function setTime(value) {
    const seconds = (value % 60).toString();
    const minutes = Math.trunc(value / 60).toString();
    const timer = document.querySelector('.timer');
    timer.innerHTML = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
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
    const sizeOptionsRow = createElement('div', 'matrix-sizes-row');
    const sizeDescription = createElement('p', 'matrix-sizes-description');
    sizeDescription.textContent = 'You can choose another size of puzzle:'
    sizeOptionsRow.append(sizeDescription)
    for (let i = 3; i <= 8; i++) {
        const button = createElement('button', 'button', 'small-btn', `btn-size-${i}`)
        button.textContent = `${i}*${i}`
        button.addEventListener('click', restartGame)
        sizeOptionsRow.append(button);
    }
    wrapper.append(sizeOptionsRow)
}

/*=================CONTROLLER===================*/
const addTileClickHandler = (matrix) => {
    document.querySelector('.squares-container').addEventListener('click', (e) => {
        const value = e.target.innerText;
        if (tryToMove(matrix, value)) {
            document.querySelector('.squares-container').remove();
            drawMatrix(matrix);
            addTileClickHandler(matrix);
        } else {
            highlightWrongElement(value);
        }
    })
}

function setMatrixSize(value = 4) {
    MATRIX_SIZE = value;
    // return value;
}

function initGameStates(value) {
    const gameState = {
        MATRIX_SIZE: value,
        EMPTY_TILE: '',
        isPaused: false,
        moves: 0,
        time: 0,
    };
    return gameState;
}

function startGame() {
    // const gameState = initGameStates(4)
    // const matrix = makeMatrix(gameState.MATRIX_SIZE * gameState.MATRIX_SIZE);
    setMatrixSize(4);
    const matrix = makeMatrix(MATRIX_SIZE * MATRIX_SIZE);
    shuffleMatrix(matrix);
    drawWrapper();
    addButtons();
    addTimeScore();
    drawMatrix(matrix);
    addSizeOptions();
    addTileClickHandler(matrix);
    setInterval(timeIncrease, 1000);

}

startGame()

// const matrix = makeMatrix(MATRIX_SIZE*MATRIX_SIZE);
// const matrix =[
//     [ '1', '2', '3', '4' ],
//     [ '5', '6', '', '8' ],
//     [ '9', '10', '11', '12' ],
//     [ '13', '14', '15', '7' ]
// ]
// console.log('matrix START', matrix)
// console.log('shuffleMatrix(matrix)', shuffleMatrix(matrix));
// // tryToMove(matrix, '11')
// // console.log('canMove(11)', tryToMove('11'));
// console.log('matrix AFTER', matrix)
// console.log('canMove(2)', tryToMove(2));
// console.log('matrix AFTER', matrix)

function restartGame(e) {
    e.preventDefault();
    console.log(e.target.innerText.slice(-1), 'e.target.innerText.slice(-1)')
    const matrixSize = e.target.innerText.slice(-1);
    setMatrixSize(matrixSize);
    RIGHT_ORDER = makeMatrix(matrixSize*matrixSize)
    console.log('restartGame')
    document.querySelector('.squares-container').remove();
    // const matrix = makeMatrix(MATRIX_SIZE*MATRIX_SIZE);
    const matrix = makeMatrix(matrixSize * matrixSize);
    console.log(matrix, 'restart matrix')
    shuffleMatrix(matrix);
    drawMatrix(matrix);
    addTileClickHandler(matrix);
    document.querySelector('.score-steps').textContent = 0;
    document.querySelector('.timer').textContent = '00:00';
    time = 0;
}

function pauseGame() {
    console.log('pauseGame')
    pausedTimer()
    // clearInterval(setTimerInterval);
    const overlay = createElement('div', 'overlay')
    const modal = createElement('div', 'modal')
    const note = createElement('div', 'note')
    note.textContent = 'You stopped the game, to continue press the button:'
    const continueBtn = createElement('button', 'button', 'continue-button');
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', continueGame);
    // modal.append(note)
    modal.append(note, continueBtn)
    overlay.append(modal)
    document.querySelector('body').prepend(overlay)
}

function continueGame() {
    console.log('continueGame')
    const overlay = document.querySelector('.overlay');
    overlay.remove();
    startTimer();
}

function finishGame() {
    console.log('finishGame')
    pausedTimer()
    const overlay = createElement('div', 'overlay')
    const modal = createElement('div', 'modal')
    const note = createElement('div', 'note')
    note.textContent = `Hooray! You solved the puzzle in ${time}sec and ${steps} moves!`
//make overlay only for puzzleContainer
    modal.append(note)
    overlay.append(modal)
    document.querySelector('body').prepend(overlay)
}

function saveGame() {
    console.log('saveGame')
}

function showGameResults() {
    console.log('showGameResults')
}