/* =========================================
   HTML Chess - Game Logic
   ========================================= */

const ChessGame = (() => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    let board = [];
    let turn = "white";
    let selectedSquare = null;
    let gameOver = false;

    let castling = {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true
    };

    let enPassantTarget = null;
    let history = [];

    /* -----------------------------------------
       Board creation
       ----------------------------------------- */

    function createInitialBoard() {
        board = Array.from({ length: 8 }, () =>
            Array.from({ length: 8 }, () => null)
        );

        const backRank = [
            "rook",
            "knight",
            "bishop",
            "queen",
            "king",
            "bishop",
            "knight",
            "rook"
        ];

        for (let col = 0; col < 8; col++) {
            board[0][col] = {
                type: backRank[col],
                color: "black"
            };

            board[1][col] = {
                type: "pawn",
                color: "black"
            };

            board[6][col] = {
                type: "pawn",
                color: "white"
            };

            board[7][col] = {
                type: backRank[col],
                color: "white"
            };
        }
    }

    /* -----------------------------------------
       Utility functions
       ----------------------------------------- */

    function isInside(row, col) {
        return (
            row >= 0 &&
            row < 8 &&
            col >= 0 &&
            col < 8
        );
    }

    function cloneBoard(source) {
        return source.map(row =>
            row.map(piece =>
                piece ? { ...piece } : null
            )
        );
    }

    function oppositeColor(color) {
        return color === "white" ? "black" : "white";
    }

    function squareName(row, col) {
        return files[col] + (8 - row);
    }

    function findKing(color, position = board) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = position[row][col];

                if (
                    piece &&
                    piece.type === "king" &&
                    piece.color === color
                ) {
                    return { row, col };
                }
            }
        }

        return null;
    }

    /* -----------------------------------------
       Attack detection
       ----------------------------------------- */

    function isSquareAttacked(row, col, byColor, position = board) {
        const pawnDirection = byColor === "white" ? -1 : 1;
        const pawnRow = row - pawnDirection;

        for (const dc of [-1, 1]) {
            const pawnCol = col - dc;

            if (isInside(pawnRow, pawnCol)) {
                const piece = position[pawnRow][pawnCol];

                if (
                    piece &&
                    piece.color === byColor &&
                    piece.type === "pawn"
                ) {
                    return true;
                }
            }
        }

        const knightMoves = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        for (const [dr, dc] of knightMoves) {
            const r = row + dr;
            const c = col + dc;

            if (!isInside(r, c)) continue;

            const piece = position[r][c];

            if (
                piece &&
                piece.color === byColor &&
                piece.type === "knight"
            ) {
                return true;
            }
        }

        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];

        for (let i = 0; i < directions.length; i++) {
            const [dr, dc] = directions[i];

            let r = row + dr;
            let c = col + dc;

            while (isInside(r, c)) {
                const piece = position[r][c];

                if (piece) {
                    if (piece.color === byColor) {
                        const diagonal = i >= 4;

                        if (
                            piece.type === "queen" ||
                            (diagonal && piece.type === "bishop") ||
                            (!diagonal && piece.type === "rook")
                        ) {
                            return true;
                        }
                    }

                    break;
                }

                r += dr;
                c += dc;
            }
        }

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const r = row + dr;
                const c = col + dc;

                if (!isInside(r, c)) continue;

                const piece = position[r][c];

                if (
                    piece &&
                    piece.color === byColor &&
                    piece.type === "king"
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    function isInCheck(color, position = board) {
        const king = findKing(color, position);

        if (!king) {
            return true;
        }

        return isSquareAttacked(
            king.row,
            king.col,
            oppositeColor(color),
            position
        );
    }

    /* -----------------------------------------
       Piece movement
       ----------------------------------------- */

    function getPseudoMoves(row, col, position = board) {
        const piece = position[row][col];

        if (!piece) return [];

        const moves = [];

        const addMove = (r, c, special = null) => {
            if (!isInside(r, c)) return;

            const target = position[r][c];

            if (!target || target.color !== piece.color) {
                moves.push({
                    from: { row, col },
                    to: { row: r, col: c },
                    special
                });
            }
        };

        if (piece.type === "pawn") {
            const direction = piece.color === "white" ? -1 : 1;
            const startRow = piece.color === "white" ? 6 : 1;

            if (
                isInside(row + direction, col) &&
                !position[row + direction][col]
            ) {
                addMove(row + direction, col);

                if (
                    row === startRow &&
                    !position[row + direction * 2][col]
                ) {
                    addMove(
                        row + direction * 2,
                        col,
                        "pawn-double"
                    );
                }
            }

            for (const dc of [-1, 1]) {
                const r = row + direction;
                const c = col + dc;

                if (!isInside(r, c)) continue;

                const target = position[r][c];

                if (target && target.color !== piece.color) {
                    addMove(r, c);
                }

                if (
                    enPassantTarget &&
                    enPassantTarget.row === r &&
                    enPassantTarget.col === c
                ) {
                    addMove(r, c, "en-passant");
                }
            }
        }

        if (piece.type === "knight") {
            const moveset = [
                [-2, -1],
                [-2, 1],
                [-1, -2],
                [-1, 2],
                [1, -2],
                [1, 2],
                [2, -1],
                [2, 1]
            ];

            for (const [dr, dc] of moveset) {
                addMove(row + dr, col + dc);
            }
        }

        if (
            piece.type === "bishop" ||
            piece.type === "rook" ||
            piece.type === "queen"
        ) {
            const directions = [];

            if (
                piece.type === "bishop" ||
                piece.type === "queen"
            ) {
                directions.push(
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                );
            }

            if (
                piece.type === "rook" ||
                piece.type === "queen"
            ) {
                directions.push(
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                );
            }

            for (const [dr, dc] of directions) {
                let r = row + dr;
                let c = col + dc;

                while (isInside(r, c)) {
                    const target = position[r][c];

                    if (!target) {
                        moves.push({
                            from: { row, col },
                            to: { row: r, col: c },
                            special: null
                        });
                    } else {
                        if (target.color !== piece.color) {
                            moves.push({
                                from: { row, col },
                                to: { row: r, col: c },
                                special: null
                            });
                        }

                        break;
                    }

                    r += dr;
                    c += dc;
                }
            }
        }

        if (piece.type === "king") {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;

                    addMove(row + dr, col + dc);
                }
            }

            /* Castling */

            const enemy = oppositeColor(piece.color);

            if (
                piece.color === "white" &&
                row === 7 &&
                col === 4
            ) {
                if (
                    castling.whiteKingSide &&
                    position[7][5] === null &&
                    position[7][6] === null &&
                    position[7][7]?.type === "rook" &&
                    position[7][7]?.color === "white" &&
                    !isSquareAttacked(7, 4, enemy, position) &&
                    !isSquareAttacked(7, 5, enemy, position) &&
                    !isSquareAttacked(7, 6, enemy, position)
                ) {
                    moves.push({
                        from: { row, col },
                        to: { row: 7, col: 6 },
                        special: "castle-kingside"
                    });
                }

                if (
                    castling.whiteQueenSide &&
                    position[7][1] === null &&
                    position[7][2] === null &&
                    position[7][3] === null &&
                    position[7][0]?.type === "rook" &&
                    position[7][0]?.color === "white" &&
                    !isSquareAttacked(7, 4, enemy, position) &&
                    !isSquareAttacked(7, 3, enemy, position) &&
                    !isSquareAttacked(7, 2, enemy, position)
                ) {
                    moves.push({
                        from: { row, col },
                        to: { row: 7, col: 2 },
                        special: "castle-queenside"
                    });
                }
            }

            if (
                piece.color === "black" &&
                row === 0 &&
                col === 4
            ) {
                if (
                    castling.blackKingSide &&
                    position[0][5] === null &&
                    position[0][6] === null &&
                    position[0][7]?.type === "rook" &&
                    position[0][7]?.color === "black" &&
                    !isSquareAttacked(0, 4, enemy, position) &&
                    !isSquareAttacked(0, 5, enemy, position) &&
                    !isSquareAttacked(0, 6, enemy, position)
                ) {
                    moves.push({
                        from: { row, col },
                        to: { row: 0, col: 6 },
                        special: "castle-kingside"
                    });
                }

                if (
                    castling.blackQueenSide &&
                    position[0][1] === null &&
                    position[0][2] === null &&
                    position[0][3] === null &&
                    position[0][0]?.type === "rook" &&
                    position[0][0]?.color === "black" &&
                    !isSquareAttacked(0, 4, enemy, position) &&
                    !isSquareAttacked(0, 3, enemy, position) &&
                    !isSquareAttacked(0, 2, enemy, position)
                ) {
                    moves.push({
                        from: { row, col },
                        to: { row: 0, col: 2 },
                        special: "castle-queenside"
                    });
                }
            }
        }

        return moves;
    }

    /* -----------------------------------------
       Simulate a move
       ----------------------------------------- */

    function simulateMove(move, position = board) {
        const next = cloneBoard(position);

        const piece = next[move.from.row][move.from.col];

        next[move.from.row][move.from.col] = null;

        if (move.special === "en-passant") {
            const capturedRow =
                piece.color === "white"
                    ? move.to.row + 1
                    : move.to.row - 1;

            next[capturedRow][move.to.col] = null;
        }

        next[move.to.row][move.to.col] = piece;

        if (move.special === "castle-kingside") {
            const row = move.from.row;

            next[row][5] = next[row][7];
            next[row][7] = null;
        }

        if (move.special === "castle-queenside") {
            const row = move.from.row;

            next[row][3] = next[row][0];
            next[row][0] = null;
        }

        return next;
    }

    /* -----------------------------------------
       Legal moves
       ----------------------------------------- */

    function getLegalMoves(row, col) {
        const piece = board[row][col];

        if (!piece || piece.color !== turn) {
            return [];
        }

        const pseudoMoves = getPseudoMoves(row, col);
        const legalMoves = [];

        for (const move of pseudoMoves) {
            const next = simulateMove(move);

            if (!isInCheck(piece.color, next)) {
                legalMoves.push(move);
            }
        }

        return legalMoves;
    }

    function getAllLegalMoves(color = turn) {
        const moves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];

                if (!piece || piece.color !== color) continue;

                const originalTurn = turn;
                turn = color;

                moves.push(...getLegalMoves(row, col));

                turn = originalTurn;
            }
        }

        return moves;
    }

    /* -----------------------------------------
       Move execution
       ----------------------------------------- */

    function makeMove(move, promotion = "queen") {
        if (gameOver) return false;

        const piece = board[move.from.row][move.from.col];

        if (!piece || piece.color !== turn) {
            return false;
        }

        const legalMoves = getLegalMoves(
            move.from.row,
            move.from.col
        );

        const legal = legalMoves.find(
            m =>
                m.to.row === move.to.row &&
                m.to.col === move.to.col &&
                m.special === move.special
        );

        if (!legal) {
            return false;
        }

        /* Save state for undo */

        history.push({
            board: cloneBoard(board),
            turn,
            castling: { ...castling },
            enPassantTarget: enPassantTarget
                ? { ...enPassantTarget }
                : null
        });

        const capturedPiece =
            board[move.to.row][move.to.col];

        /* Execute */

        board = simulateMove(move);

        /* Update castling rights */

        updateCastlingRights(piece, move, capturedPiece);

        /* En passant */

        enPassantTarget = null;

        if (
            piece.type === "pawn" &&
            Math.abs(move.to.row - move.from.row) === 2
        ) {
            enPassantTarget = {
                row: (move.from.row + move.to.row) / 2,
                col: move.from.col
            };
        }

        /* Pawn promotion */

        if (
            piece.type === "pawn" &&
            (move.to.row === 0 || move.to.row === 7)
        ) {
            board[move.to.row][move.to.col] = {
                type: promotion,
                color: piece.color
            };
        }

        /* Change turn */

        turn = oppositeColor(turn);
        selectedSquare = null;

        updateGameState();

        return true;
    }

    function updateCastlingRights(piece, move, capturedPiece) {
        if (piece.type === "king") {
            if (piece.color === "white") {
                castling.whiteKingSide = false;
                castling.whiteQueenSide = false;
            } else {
                castling.blackKingSide = false;
                castling.blackQueenSide = false;
            }
        }

        if (piece.type === "rook") {
            if (piece.color === "white") {
                if (move.from.row === 7 && move.from.col === 0) {
                    castling.whiteQueenSide = false;
                }

                if (move.from.row === 7 && move.from.col === 7) {
                    castling.whiteKingSide = false;
                }
            } else {
                if (move.from.row === 0 && move.from.col === 0) {
                    castling.blackQueenSide = false;
                }

                if (move.from.row === 0 && move.from.col === 7) {
                    castling.blackKingSide = false;
                }
            }
        }

        if (
            capturedPiece &&
            capturedPiece.type === "rook"
        ) {
            if (
                move.to.row === 7 &&
                move.to.col === 0
            ) {
                castling.whiteQueenSide = false;
            }

            if (
                move.to.row === 7 &&
                move.to.col === 7
            ) {
                castling.whiteKingSide = false;
            }

            if (
                move.to.row === 0 &&
                move.to.col === 0
            ) {
                castling.blackQueenSide = false;
            }

            if (
                move.to.row === 0 &&
                move.to.col === 7
            ) {
                castling.blackKingSide = false;
            }
        }
    }

    /* -----------------------------------------
       Checkmate / stalemate
       ----------------------------------------- */

    function updateGameState() {
        const legalMoves = getAllLegalMoves(turn);
        const inCheck = isInCheck(turn);

        if (legalMoves.length === 0) {
            gameOver = true;

            if (inCheck) {
                showStatus(
                    `${capitalize(oppositeColor(turn))} wins by checkmate!`
                );
            } else {
                showStatus("Draw by stalemate.");
            }

            return;
        }

        if (inCheck) {
            showStatus(
                `${capitalize(turn)} is in check!`
            );
        } else {
            showStatus(
                `${capitalize(turn)}'s turn`
            );
        }
    }

    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function showStatus(message) {
        const status = document.getElementById("game-status");

        if (status) {
            status.textContent = message;
        }
    }

    /* -----------------------------------------
       Undo
       ----------------------------------------- */

    function undo() {
        if (history.length === 0) return false;

        const previous = history.pop();

        board = previous.board;
        turn = previous.turn;
        castling = previous.castling;
        enPassantTarget = previous.enPassantTarget;

        gameOver = false;
        selectedSquare = null;

        updateGameState();

        return true;
    }

    /* -----------------------------------------
       New game
       ----------------------------------------- */

    function newGame() {
        createInitialBoard();

        turn = "white";
        selectedSquare = null;
        gameOver = false;

        castling = {
            whiteKingSide: true,
            whiteQueenSide: true,
            blackKingSide: true,
            blackQueenSide: true
        };

        enPassantTarget = null;
        history = [];

        showStatus("White's turn");

        if (typeof Board !== "undefined" &&
            typeof Board.render === "function") {
            Board.render(board);
        }
    }

    /* -----------------------------------------
       Public API
       ----------------------------------------- */

    return {
        getBoard: () => board,
        getTurn: () => turn,
        getSelectedSquare: () => selectedSquare,

        setSelectedSquare: square => {
            selectedSquare = square;
        },

        getLegalMoves,
        getAllLegalMoves,
        makeMove,
        undo,
        newGame,
        isInCheck,
        isSquareAttacked,
        squareName
    };
})();

/* Make the game available globally */

window.ChessGame = ChessGame;
