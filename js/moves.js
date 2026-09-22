/* ==============================
   HTML Chess - Move Generation
   ============================== */

/*
    A move is represented as:

    {
        from: { row, col },
        to: { row, col }
    }

    This file generates pseudo-legal moves.
    Check/checkmate validation can be handled
    by game.js.
*/


/**
 * Get every possible move for a piece.
 */
function getPieceMoves(board, row, col) {
    const piece = board[row][col];

    if (!piece) {
        return [];
    }

    switch (piece.type) {
        case "pawn":
            return getPawnMoves(board, row, col);

        case "knight":
            return getKnightMoves(board, row, col);

        case "bishop":
            return getSlidingMoves(
                board,
                row,
                col,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ]
            );

        case "rook":
            return getSlidingMoves(
                board,
                row,
                col,
                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]
            );

        case "queen":
            return getSlidingMoves(
                board,
                row,
                col,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1],
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]
            );

        case "king":
            return getKingMoves(board, row, col);

        default:
            return [];
    }
}


/* ==============================
   Pawn
   ============================== */

function getPawnMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    const direction = piece.color === "white" ? -1 : 1;
    const startingRow = piece.color === "white" ? 6 : 1;

    const oneStep = row + direction;

    // Move forward one square
    if (
        isInsideBoard(oneStep, col) &&
        !isOccupied(board, oneStep, col)
    ) {
        moves.push({
            from: { row, col },
            to: { row: oneStep, col }
        });

        // Move forward two squares from starting position
        const twoStep = row + direction * 2;

        if (
            row === startingRow &&
            !isOccupied(board, twoStep, col)
        ) {
            moves.push({
                from: { row, col },
                to: { row: twoStep, col }
            });
        }
    }

    // Capture diagonally
    for (const columnOffset of [-1, 1]) {
        const targetCol = col + columnOffset;

        if (
            isInsideBoard(oneStep, targetCol) &&
            isEnemyPiece(board, oneStep, targetCol, piece.color)
        ) {
            moves.push({
                from: { row, col },
                to: {
                    row: oneStep,
                    col: targetCol
                }
            });
        }
    }

    return moves;
}


/* ==============================
   Knight
   ============================== */

function getKnightMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    const offsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for (const [rowOffset, colOffset] of offsets) {
        const targetRow = row + rowOffset;
        const targetCol = col + colOffset;

        if (!isInsideBoard(targetRow, targetCol)) {
            continue;
        }

        const target = board[targetRow][targetCol];

        if (!target || target.color !== piece.color) {
            moves.push({
                from: { row, col },
                to: {
                    row: targetRow,
                    col: targetCol
                }
            });
        }
    }

    return moves;
}


/* ==============================
   Sliding Pieces
   ============================== */

function getSlidingMoves(board, row, col, directions) {
    const piece = board[row][col];
    const moves = [];

    for (const [rowDirection, colDirection] of directions) {
        let targetRow = row + rowDirection;
        let targetCol = col + colDirection;

        while (isInsideBoard(targetRow, targetCol)) {
            const target = board[targetRow][targetCol];

            // Empty square
            if (!target) {
                moves.push({
                    from: { row, col },
                    to: {
                        row: targetRow,
                        col: targetCol
                    }
                });
            } else {
                // Enemy piece can be captured
                if (target.color !== piece.color) {
                    moves.push({
                        from: { row, col },
                        to: {
                            row: targetRow,
                            col: targetCol
                        }
                    });
                }

                // Pieces block further movement
                break;
            }

            targetRow += rowDirection;
            targetCol += colDirection;
        }
    }

    return moves;
}


/* ==============================
   King
   ============================== */

function getKingMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) {
                continue;
            }

            const targetRow = row + rowOffset;
            const targetCol = col + colOffset;

            if (!isInsideBoard(targetRow, targetCol)) {
                continue;
            }

            const target = board[targetRow][targetCol];

            if (!target || target.color !== piece.color) {
                moves.push({
                    from: { row, col },
                    to: {
                        row: targetRow,
                        col: targetCol
                    }
                });
            }
        }
    }

    return moves;
}


/* ==============================
   All Moves For A Color
   ============================== */

function getAllMoves(board, color) {
    const moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (!piece || piece.color !== color) {
                continue;
            }

            moves.push(
                ...getPieceMoves(board, row, col)
            );
        }
    }

    return moves;
}


/* ==============================
   Move Validation
   ============================== */

function isMoveLegal(board, move) {
    const piece = board[move.from.row][move.from.col];

    if (!piece) {
        return false;
    }

    const moves = getPieceMoves(
        board,
        move.from.row,
        move.from.col
    );

    return moves.some(candidate =>
        candidate.to.row === move.to.row &&
        candidate.to.col === move.to.col
    );
}
```
```javascript
/* ==============================
   HTML Chess - Move Generation
   ============================== */

/*
    A move is represented as:

    {
        from: { row, col },
        to: { row, col }
    }

    This file generates pseudo-legal moves.
    Check/checkmate validation can be handled
    by game.js.
*/


/**
 * Get every possible move for a piece.
 */
function getPieceMoves(board, row, col) {
    const piece = board[row][col];

    if (!piece) {
        return [];
    }

    switch (piece.type) {
        case "pawn":
            return getPawnMoves(board, row, col);

        case "knight":
            return getKnightMoves(board, row, col);

        case "bishop":
            return getSlidingMoves(
                board,
                row,
                col,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ]
            );

        case "rook":
            return getSlidingMoves(
                board,
                row,
                col,
                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]
            );

        case "queen":
            return getSlidingMoves(
                board,
                row,
                col,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1],
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]
            );

        case "king":
            return getKingMoves(board, row, col);

        default:
            return [];
    }
}


/* ==============================
   Pawn
   ============================== */

function getPawnMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    const direction = piece.color === "white" ? -1 : 1;
    const startingRow = piece.color === "white" ? 6 : 1;

    const oneStep = row + direction;

    // Move forward one square
    if (
        isInsideBoard(oneStep, col) &&
        !isOccupied(board, oneStep, col)
    ) {
        moves.push({
            from: { row, col },
            to: { row: oneStep, col }
        });

        // Move forward two squares from starting position
        const twoStep = row + direction * 2;

        if (
            row === startingRow &&
            !isOccupied(board, twoStep, col)
        ) {
            moves.push({
                from: { row, col },
                to: { row: twoStep, col }
            });
        }
    }

    // Capture diagonally
    for (const columnOffset of [-1, 1]) {
        const targetCol = col + columnOffset;

        if (
            isInsideBoard(oneStep, targetCol) &&
            isEnemyPiece(board, oneStep, targetCol, piece.color)
        ) {
            moves.push({
                from: { row, col },
                to: {
                    row: oneStep,
                    col: targetCol
                }
            });
        }
    }

    return moves;
}


/* ==============================
   Knight
   ============================== */

function getKnightMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    const offsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for (const [rowOffset, colOffset] of offsets) {
        const targetRow = row + rowOffset;
        const targetCol = col + colOffset;

        if (!isInsideBoard(targetRow, targetCol)) {
            continue;
        }

        const target = board[targetRow][targetCol];

        if (!target || target.color !== piece.color) {
            moves.push({
                from: { row, col },
                to: {
                    row: targetRow,
                    col: targetCol
                }
            });
        }
    }

    return moves;
}


/* ==============================
   Sliding Pieces
   ============================== */

function getSlidingMoves(board, row, col, directions) {
    const piece = board[row][col];
    const moves = [];

    for (const [rowDirection, colDirection] of directions) {
        let targetRow = row + rowDirection;
        let targetCol = col + colDirection;

        while (isInsideBoard(targetRow, targetCol)) {
            const target = board[targetRow][targetCol];

            // Empty square
            if (!target) {
                moves.push({
                    from: { row, col },
                    to: {
                        row: targetRow,
                        col: targetCol
                    }
                });
            } else {
                // Enemy piece can be captured
                if (target.color !== piece.color) {
                    moves.push({
                        from: { row, col },
                        to: {
                            row: targetRow,
                            col: targetCol
                        }
                    });
                }

                // Pieces block further movement
                break;
            }

            targetRow += rowDirection;
            targetCol += colDirection;
        }
    }

    return moves;
}


/* ==============================
   King
   ============================== */

function getKingMoves(board, row, col) {
    const piece = board[row][col];
    const moves = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) {
                continue;
            }

            const targetRow = row + rowOffset;
            const targetCol = col + colOffset;

            if (!isInsideBoard(targetRow, targetCol)) {
                continue;
            }

            const target = board[targetRow][targetCol];

            if (!target || target.color !== piece.color) {
                moves.push({
                    from: { row, col },
                    to: {
                        row: targetRow,
                        col: targetCol
                    }
                });
            }
        }
    }

    return moves;
}


/* ==============================
   All Moves For A Color
   ============================== */

function getAllMoves(board, color) {
    const moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (!piece || piece.color !== color) {
                continue;
            }

            moves.push(
                ...getPieceMoves(board, row, col)
            );
        }
    }

    return moves;
}


/* ==============================
   Move Validation
   ============================== */

function isMoveLegal(board, move) {
    const piece = board[move.from.row][move.from.col];

    if (!piece) {
        return false;
    }

    const moves = getPieceMoves(
        board,
        move.from.row,
        move.from.col
    );

    return moves.some(candidate =>
        candidate.to.row === move.to.row &&
        candidate.to.col === move.to.col
    );
}
