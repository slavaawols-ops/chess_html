/* ==============================
   HTML Chess - Chess Pieces
   ============================== */

/*
    Piece format:

    {
        type: "pawn",
        color: "white",
        symbol: "♙"
    }

    Board coordinates:
    row 0 = Black's back rank
    row 7 = White's back rank
*/

const PIECES = {
    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};


/**
 * Creates a chess piece.
 */
function createPiece(type, color) {
    return {
        type: type,
        color: color,
        symbol: PIECES[color][type]
    };
}


/**
 * Creates the standard starting chess position.
 *
 * The board is an 8×8 array.
 */
function createStartingPosition() {
    const board = Array.from(
        { length: 8 },
        () => Array(8).fill(null)
    );

    // Black pieces
    board[0] = [
        createPiece("rook", "black"),
        createPiece("knight", "black"),
        createPiece("bishop", "black"),
        createPiece("queen", "black"),
        createPiece("king", "black"),
        createPiece("bishop", "black"),
        createPiece("knight", "black"),
        createPiece("rook", "black")
    ];

    // Black pawns
    for (let col = 0; col < 8; col++) {
        board[1][col] = createPiece("pawn", "black");
    }

    // White pawns
    for (let col = 0; col < 8; col++) {
        board[6][col] = createPiece("pawn", "white");
    }

    // White pieces
    board[7] = [
        createPiece("rook", "white"),
        createPiece("knight", "white"),
        createPiece("bishop", "white"),
        createPiece("queen", "white"),
        createPiece("king", "white"),
        createPiece("bishop", "white"),
        createPiece("knight", "white"),
        createPiece("rook", "white")
    ];

    return board;
}


/**
 * Creates a deep copy of a board.
 *
 * Useful for testing moves without
 * changing the actual game position.
 */
function cloneBoard(board) {
    return board.map(row =>
        row.map(piece => {
            if (!piece) {
                return null;
            }

            return {
                type: piece.type,
                color: piece.color,
                symbol: piece.symbol
            };
        })
    );
}


/**
 * Returns the opposite chess color.
 */
function oppositeColor(color) {
    return color === "white" ? "black" : "white";
}


/**
 * Returns whether a square contains a piece.
 */
function isOccupied(board, row, col) {
    return board[row][col] !== null;
}


/**
 * Returns whether a square contains an enemy piece.
 */
function isEnemyPiece(board, row, col, color) {
    const piece = board[row][col];

    return piece !== null && piece.color !== color;
}


/**
 * Returns whether a coordinate is inside the board.
 */
function isInsideBoard(row, col) {
    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}
