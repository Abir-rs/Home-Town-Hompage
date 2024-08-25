document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const statusDisplay = document.getElementById("status");
    const modeSelect = document.getElementById("mode");
    const modal = document.getElementById("modal");
    const modalOverlay = document.getElementById("modal-overlay");
    const modalMessage = document.getElementById("modal-message");
    const modalButton = document.getElementById("modal-button");

    let currentPlayer = "X";
    let gameActive = true;
    let gameState = ["", "", "", "", "", "", "", "", ""];

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;
        clickedCell.classList.add(currentPlayer); // Add color class
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;
    }

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i < 8; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === "" || b === "" || c === "") {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            endGame(`Player ${currentPlayer} has won!`);
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            endGame("Game ended in a draw!");
            return;
        }

        handlePlayerChange();
    }

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = Array.from(clickedCell.parentNode.children).indexOf(clickedCell);

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();

        if (modeSelect.value === "ai" && gameActive && currentPlayer === "O") {
            setTimeout(() => handleAIMove(), 500);
        }
    }

    function handleAIMove() {
        const bestMove = minimax(gameState, currentPlayer).index;
        const cell = board.children[bestMove];
        cell.click();
    }

    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;
        document.querySelectorAll(".cell").forEach(cell => {
            cell.innerHTML = "";
            cell.classList.remove("X", "O"); // Remove color classes
        });
        closeModal();
    }

    function endGame(message) {
        gameActive = false;
        statusDisplay.innerHTML = message;
        showModal(message);
    }

    function showModal(message) {
        modalMessage.innerText = message;
        modal.style.display = "block";
        modalOverlay.style.display = "block";
    }

    function closeModal() {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    }

    modalButton.addEventListener("click", handleRestartGame);

    function minimax(newBoard, player) {
        const availSpots = newBoard.map((val, index) => val === "" ? index : null).filter(val => val !== null);

        if (checkWin(newBoard, "X")) {
            return { score: -10 };
        } else if (checkWin(newBoard, "O")) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === "O") {
                const result = minimax(newBoard, "X");
                move.score = result.score;
            } else {
                const result = minimax(newBoard, "O");
                move.score = result.score;
            }

            newBoard[availSpots[i]] = "";
            moves.push(move);
        }

        let bestMove;
        if (player === "O") {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    function checkWin(board, player) {
        return winningConditions.some(condition => {
            return condition.every(index => board[index] === player);
        });
    }

    document.querySelectorAll(".cell").forEach(cell => cell.addEventListener("click", handleCellClick));
    document.getElementById("restart").addEventListener("click", handleRestartGame);
});
