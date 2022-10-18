const MATRIX_SIZE = 4;
const EMPTY_TILE = 0;

const exMatrix = [[1, 2, 3],[ 4, 0, 5],[ 6, 7, 8]];

const makeMatrix = (n) => {
    const array = [];
    for (let i = 1; i < n; i++) {
        array.push(i);
    }
    array.push(EMPTY_TILE);

    const matrix = [];
    const matrixSize = Math.sqrt(n);

    for (let i = 0; i < matrixSize; i++) {
        matrix.push(array.slice(i*matrixSize, i*matrixSize+matrixSize))
    }
    return matrix;
}

const findCoordinates = (matrix, value) => {
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
    const
        x1 = a[0],
        y1 = a[1],
        x2 = b[0],
        y2 = b[1];
    [matrix[x1][y1], matrix[x2][y2]] = [matrix[x2][y2], matrix[x1][y1]]
}

const tryToMove = (matrix, curEl) => {
    const emptyElCoordinates = findCoordinates(matrix, EMPTY_TILE)
    const curElCoordinates = findCoordinates(matrix, curEl);
    //function to sravnit' coordinati
    if (emptyElCoordinates[0] === curElCoordinates[0] && (Math.abs(emptyElCoordinates[1] - curElCoordinates[1])=== 1)) {
        swapElements(matrix, curElCoordinates, emptyElCoordinates);
        console.log('can move, curElCoordinates:', curElCoordinates)
        //
        // return true;
    }
    if (emptyElCoordinates[1] === curElCoordinates[1] && (Math.abs(emptyElCoordinates[0] - curElCoordinates[0])=== 1)) {
        swapElements(matrix, curElCoordinates, emptyElCoordinates);
        console.log('can move, curElCoordinates:', curElCoordinates)
        // return true;
    }
    else {
        console.log('forbidden, curElCoordinates:', curElCoordinates)
        return false
    }

}

// checkIfGameOver



const startGame = () => {
    const matrix = makeMatrix(MATRIX_SIZE*MATRIX_SIZE);
}


console.log('canMove(12)', tryToMove(12));
console.log('matrix AFTER', matrix)
console.log('canMove(11)', tryToMove(11));
console.log('matrix AFTER', matrix)
console.log('canMove(2)', tryToMove(2));
console.log('matrix AFTER', matrix)


/*====================================*/