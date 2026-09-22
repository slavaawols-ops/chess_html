/* ==============================
   HTML Chess - Main
   ============================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("HTML Chess starting...");

    // Start the chess game.
    if (typeof initializeGame === "function") {
        initializeGame();
    } else {
        console.error("initializeGame() was not found.");
    }

    // New Game button.
    const newGameButton = document.getElementById("new-game");

    if (newGameButton) {
        newGameButton.addEventListener("click", () => {
            if (typeof initializeGame === "function") {
                initializeGame();
            }
        });
    }

    // Undo button.
    const undoButton = document.getElementById("undo-move");

    if (undoButton) {
        undoButton.addEventListener("click", () => {
            if (typeof undoMove === "function") {
                undoMove();
            }
        });
    }
});
