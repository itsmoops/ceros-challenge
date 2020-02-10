import "../css/game.css";
import { Game } from "./Core/Game.js";

document.addEventListener("DOMContentLoaded", () => {
    let skiGame;

    function initializeNewGame() {
        skiGame = new Game();
        skiGame.load().then(() => {
            skiGame.init();
            skiGame.run();
        });
    }

    initializeNewGame();

    // Adding the ability to restart the game once the game has ended by pressing "R".
    document.addEventListener("keydown", () => {
        if (skiGame.gameOver) {
            initializeNewGame();
            event.preventDefault();
        }
    });
});
