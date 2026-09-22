/* ==============================
   HTML Chess - Board
   ============================== */

const chessBoard = document.getElementById("chess-board");

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 * Create the 8x8 chess board.
 */
function createBoard() {
    if (!chessBoard) {
        console.error("Chess board element was not found.");
        return;
    }

    chessBoard.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");

            const isLight = (row + col) % 2 === 0;

            square.classList.add(
                "square",
                isLight ? "light" : "dark"
            );

            const file = files[col];
            const rank = 8 - row;

            square.dataset.square = `${file}${rank}`;
            square.dataset.row = row;
            square.dataset.col = col;

            square.addEventListener("click", () => {
                handleSquareClick(square);
            });

            chessBoard.appendChild(square);
        }
    }

    renderBoard();
}

/**
 * Render the current position.
 */
function renderBoard() {
    if (!chessBoard) return;

    const squares = chessBoard.querySelectorAll(".square");

    squares.forEach(square => {
        square.innerHTML = "";

        const position = square.dataset.square;

        let piece = null;

        if (typeof getPieceAt === "function") {
            piece = getPieceAt(position);
        }

        if (piece) {
            const pieceElement = createPieceElement(piece);
            square.appendChild(pieceElement);
        }
    });
}

/**
 * Create a visual chess piece.
 */
function createPieceElement(piece) {
    const image = document.createElement("img");

    image.classList.add("piece");

    const color = piece.color;
    const type = piece.type;

    image.src = `assets/pieces/${color}-${type}.svg`;
    image.alt = `${color} ${type}`;

    image.draggable = false;

    return image;
}

/**
 * Handle clicking a square.
 */
function handleSquareClick(square) {
    const position = square.dataset.square;

    if (typeof selectSquare === "function") {
        selectSquare(position);
    }
}

/**
 * Highlight a selected square.
 */
function highlightSelectedSquare(position) {
    clearHighlights();

    const square = getSquareElement(position);

    if (square) {
        square.classList.add("selected");
    }
}

/**
 * Highlight legal moves.
 */
function highlightLegalMoves(moves) {
    if (!Array.isArray(moves)) return;

    moves.forEach(position => {
        const square = getSquareElement(position);

        if (square) {
            square.classList.add("legal-move");
        }
    });
}

/**
 * Highlight a capture.
 */
function highlightCapture(position) {
    const square = getSquareElement(position);

    if (square) {
        square.classList.add("capture");
    }
}

/**
 * Highlight the king when in check.
 */
function highlightCheck(position) {
    const square = getSquareElement(position);

    if (square) {
        square.classList.add("check");
    }
}

/**
 * Highlight the previous move.
 */
function highlightLastMove(from, to) {
    const fromSquare = getSquareElement(from);
    const toSquare = getSquareElement(to);

    if (fromSquare) {
        fromSquare.classList.add("last-move");
    }

    if (toSquare) {
        toSquare.classList.add("last-move");
    }
}

/**
 * Remove all board highlights.
 */
function clearHighlights() {
    if (!chessBoard) return;

    chessBoard.querySelectorAll(".square").forEach(square => {
        square.classList.remove(
            "selected",
            "legal-move",
            "capture",
            "check",
            "last-move"
        );
    });
}

/**
 * Get a board square element.
 */
function getSquareElement(position) {
    if (!chessBoard || !position) return null;

    return chessBoard.querySelector(
        `.square[data-square="${position}"]`
    );
}

/**
 * Flip the board orientation.
 */
function flipBoard() {
    if (!chessBoard) return;

    chessBoard.classList.toggle("flipped");
}
