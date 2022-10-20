console.log('index.js');
/*=================GAME LOGIC===================*/
const MATRIX_SIZE = 4;
const EMPTY_TILE = '';
const RIGHT_ORDER = makeMatrix(MATRIX_SIZE*MATRIX_SIZE );

const getRandomArbitrary = (min, max) => {
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
    console.log('findCoordinates', matrix, value)
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
    console.log('swapElements', matrix, a, b)
    const
        x1 = a[0],
        y1 = a[1],
        x2 = b[0],
        y2 = b[1];
    [matrix[x1][y1], matrix[x2][y2]] = [matrix[x2][y2], matrix[x1][y1]]
}

const shuffleMatrix = (matrix) => {
    for (let i = 0; i < 100; i++) {
        const emptyElCoord = findCoordinates(matrix, EMPTY_TILE);
        const chooseRandomCoord = getRandomArbitrary(0, 2);
        const isExtremeEl = (emptyElCoord[chooseRandomCoord] === 0 || emptyElCoord[chooseRandomCoord] === MATRIX_SIZE-1 )
        const elToMoveCoord = emptyElCoord.slice();
        if (isExtremeEl && emptyElCoord[chooseRandomCoord] === 0) {
            emptyElCoord[chooseRandomCoord]++
        }
        if (isExtremeEl && emptyElCoord[chooseRandomCoord] === MATRIX_SIZE-1) {
            emptyElCoord[chooseRandomCoord]--
        }
        if (!isExtremeEl) {
            emptyElCoord[chooseRandomCoord] = (getRandomArbitrary(0, 2) === 1) ?
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
        swapElements(matrix, curElCoordinates, emptyElCoordinates);
        checkIfGameOver(matrix)
        console.log('can move, curElCoordinates:', curElCoordinates)
        return true;
    }
    return false
}

const checkIfGameOver = (matrix) => {
    if (JSON.stringify(matrix) === JSON.stringify(RIGHT_ORDER)) {
        console.log("Hooray! You solved the puzzle in ##:## and N moves!")
    }
}

/*=================DRAW PUZZLE===================*/

const createElem = (tag, ...classes) => {
    const node = document.createElement(tag);
    node.classList.add(...classes);
    return node;
}

const highlightWrongElement = (curEl) => {
    const items = document.querySelectorAll('.item');
    const curItem = Array.from(items).find(el => el.textContent === curEl);
    curItem.classList.add('warning')
    setTimeout(function() {curItem.classList.remove('warning')} ,100)
}

const drawMatrix = (matrix) => {
    console.log('hi');
    const body = document.querySelector('body')
    const wrapper = createElem('div', 'wrapper');
    const squaresContainer = createElem('div', 'squares-container');
    wrapper.append(squaresContainer)

    matrix.forEach(matrixRow => {
        const row = createElem('div', 'row');
        squaresContainer.append(row);
        matrixRow.forEach(el => {
            // console.log('el', el);
            const tile = createElem('div', 'item');
            if (el === EMPTY_TILE) {

                tile.classList.add('empty-tile');
            }
            tile.textContent = el;
            row.append(tile)
        })
    })
    body.append(wrapper)

}


/*=================CONTROLLER===================*/
const addTileClickHandler = (matrix) => {
    document.querySelector('.squares-container').addEventListener('click', (e) => {
        const value = e.target.innerText;
        if (tryToMove(matrix, value)) {
            document.querySelector('.wrapper').remove();
            drawMatrix(matrix);
            addTileClickHandler(matrix);
        } else {
            highlightWrongElement(value);
        }
    })
}

const startGame = () => {
    const matrix = makeMatrix(MATRIX_SIZE*MATRIX_SIZE);
    shuffleMatrix(matrix);
    drawMatrix(matrix);
    addTileClickHandler(matrix);
}
//
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