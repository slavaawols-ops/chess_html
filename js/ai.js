/* ==============================
   HTML Chess - AI
   ============================== */

/*
    Simple chess AI using minimax.

    Expected game state format:

    {
        board: [
            ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
            ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
            [null, null, null, null, null, null, null, null],
            ...
        ],
        turn: "white"
    }

    Piece codes:
    White: wp, wr, wn, wb, wq, wk
    Black: bp, br, bn, bb, bq, bk
*/

/* Piece values */

const AI_PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};

/* Maximum search depth */

const AI_DEPTH = 2;


/* ==============================
   Public AI function
   ============================== */

function getBestMove(gameState) {
    if (!gameState || !gameState.board) {
        return null;
    }

    const moves = getAIMoves(gameState, gameState.turn);

    if (moves.length === 0) {
        return null;
    }

    let bestMove = moves[0];
    let bestScore = gameState.turn === "white"
        ? -Infinity
        : Infinity;

    for (const move of moves) {
        const newState = makeAIMove(gameState, move);

        const score = minimax(
            newState,
            AI_DEPTH - 1,
            gameState.turn === "white"
        );

        if (gameState.turn === "white") {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    return bestMove;
}


/* ==============================
   Minimax
   ============================== */

function minimax(state, depth, maximizing) {
    if (depth <= 0) {
        return evaluateBoard(state.board);
    }

    const moves = getAIMoves(state, state.turn);

    if (moves.length === 0) {
        return evaluateBoard(state.board);
    }

    if (maximizing) {
        let bestScore = -Infinity;

        for (const move of moves) {
            const nextState = makeAIMove(state, move);

            const score = minimax(
                nextState,
                depth - 1,
                false
            );

            bestScore = Math.max(bestScore, score);
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (const move of moves) {
        const nextState = makeAIMove(state, move);

        const score = minimax(
            nextState,
            depth - 1,
            true
        );

        bestScore = Math.min(bestScore, score);
    }

    return bestScore;
}


/* ==============================
   Board evaluation
   ============================== */

function evaluateBoard(board) {
    let score = 0;

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const piece = board[row][col];

            if (!piece) {
                continue;
            }

            const type = piece[1];
            const value = AI_PIECE_VALUES[type] || 0;

            if (piece[0] === "w") {
                score += value;
            } else {
                score -= value;
            }
        }
    }

    return score;
}


/* ==============================
   AI move generation
   ============================== */

/*
    If moves.js provides a legal-move generator,
    this function will use it.

    Expected function:

        getLegalMoves(state, color)

    Otherwise, it falls back to basic movement.
*/

function getAIMoves(state, color) {
    if (typeof getLegalMoves === "function") {
        return getLegalMoves(state, color);
    }

    return getBasicAIMoves(state, color);
}


/* ==============================
   Basic fallback move generator
   ============================== */

function getBasicAIMoves(state, color) {
    const moves = [];
    const board = state.board;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (!piece || piece[0] !== color[0]) {
                continue;
            }

            const type = piece[1];

            switch (type) {
                case "p":
                    generatePawnMoves(
                        board,
                        row,
                        col,
                        color,
                        moves
                    );
                    break;

                case "n":
                    generateKnightMoves(
                        board,
                        row,
                        col,
                        color,
                        moves
                    );
                    break;

                case "b":
                    generateSlidingMoves(
                        board,
                        row,
                        col,
                        color,
                        moves,
                        [
                            [1, 1],
                            [1, -1],
                            [-1, 1],
                            [-1, -1]
                        ]
                    );
                    break;

                case "r":
                    generateSlidingMoves(
                        board,
                        row,
                        col,
                        color,
                        moves,
                        [
                            [1, 0],
                            [-1, 0],
                            [0, 1],
                            [0, -1]
                        ]
                    );
                    break;

                case "q":
                    generateSlidingMoves(
                        board,
                        row,
                        col,
                        color,
                        moves,
                        [
                            [1, 1],
                            [1, -1],
                            [-1, 1],
                            [-1, -1],
                            [1, 0],
                            [-1, 0],
                            [0, 1],
                            [0, -1]
                        ]
                    );
                    break;

                case "k":
                    generateKingMoves(
                        board,
                        row,
                        col,
                        color,
                        moves
                    );
                    break;
            }
        }
    }

    return moves;
}


/* ==============================
   Pawn moves
   ============================== */

function generatePawnMoves(board, row, col, color, moves) {
    const direction = color === "white" ? -1 : 1;
    const startRow = color === "white" ? 6 : 1;

    const nextRow = row + direction;

    if (
        nextRow >= 0 &&
        nextRow < 8 &&
        !board[nextRow][col]
    ) {
        moves.push({
            from: [row, col],
            to: [nextRow, col]
        });

        const doubleRow = row + direction * 2;

        if (
            row === startRow &&
            !board[doubleRow][col]
        ) {
            moves.push({
                from: [row, col],
                to: [doubleRow, col]
            });
        }
    }

    for (const dc of [-1, 1]) {
        const targetRow = row + direction;
        const targetCol = col + dc;

        if (
            targetRow < 0 ||
            targetRow >= 8 ||
            targetCol < 0 ||
            targetCol >= 8
        ) {
            continue;
        }

        const target = board[targetRow][targetCol];

        if (
            target &&
            target[0] !== color[0]
        ) {
            moves.push({
                from: [row, col],
                to: [targetRow, targetCol]
            });
        }
    }
}


/* ==============================
   Knight moves
   ============================== */

function generateKnightMoves(board, row, col, color, moves) {
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

    for (const [dr, dc] of offsets) {
        addBasicMove(
            board,
            row,
            col,
            row + dr,
            col + dc,
            color,
            moves
        );
    }
}


/* ==============================
   King moves
   ============================== */

function generateKingMoves(board, row, col, color, moves) {
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) {
                continue;
            }

            addBasicMove(
                board,
                row,
                col,
                row + dr,
                col + dc,
                color,
                moves
            );
        }
    }
}


/* ==============================
   Sliding pieces
   ============================== */

function generateSlidingMoves(
    board,
    row,
    col,
    color,
    moves,
    directions
) {
    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;

        while (
            r >= 0 &&
            r < 8 &&
            c >= 0 &&
            c < 8
        ) {
            const target = board[r][c];

            if (!target) {
                moves.push({
                    from: [row, col],
                    to: [r, c]
                });
            } else {
                if (target[0] !== color[0]) {
                    moves.push({
                        from: [row, col],
                        to: [r, c]
                    });
                }

                break;
            }

            r += dr;
            c += dc;
        }
    }
}


/* ==============================
   Basic move helper
   ============================== */

function addBasicMove(
    board,
    fromRow,
    fromCol,
    toRow,
    toCol,
    color,
    moves
) {
    if (
        toRow < 0 ||
        toRow >= 8 ||
        toCol < 0 ||
        toCol >= 8
    ) {
        return;
    }

    const target = board[toRow][toCol];

    if (!target || target[0] !== color[0]) {
        moves.push({
            from: [fromRow, fromCol],
            to: [toRow, toCol]
        });
    }
}


/* ==============================
   Make simulated move
   ============================== */

function makeAIMove(state, move) {
    const newBoard = state.board.map(row => [...row]);

    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;

    newBoard[toRow][toCol] =
        newBoard[fromRow][fromCol];

    newBoard[fromRow][fromCol] = null;

    return {
        board: newBoard,
        turn: state.turn === "white"
            ? "black"
            : "white"
    };
}
