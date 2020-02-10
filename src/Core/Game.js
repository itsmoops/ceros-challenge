import * as Constants from "../Constants";
import { AssetManager } from "./AssetManager";
import { Canvas } from "./Canvas";
import { Skier } from "../Entities/Skier";
import { Rhino } from "../Entities/Rhino";
import { ObstacleManager } from "../Entities/Obstacles/ObstacleManager";
import { Rect } from "./Utils";

export class Game {
    gameWindow = null;
    gameOver = false;
    paused = false;
    timer = 0;

    constructor() {
        this.assetManager = new AssetManager();
        this.canvas = new Canvas(Constants.GAME_WIDTH, Constants.GAME_HEIGHT);
        this.obstacleManager = new ObstacleManager();

        /* 
			I added the current game as a new constructor prop that is passed to the Skier 
			and Rhino classes, as this made for a clean way to call the "gameOver" function once
			a collision was detected.
		*/
        this.skier = new Skier({
            x: 0,
            y: 0,
            game: this
        });

        this.rhino = new Rhino({
            x: Constants.RHINO_OFFSET_X,
            y: Constants.RHINO_OFFSET_Y,
            game: this
        });

        /*
			Creating a bound function here so I can remove the event listener once the game
			has finished
		*/
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener("keydown", this.boundHandleKeyDown);
    }

    init() {
        this.startGameTimer();
        this.obstacleManager.placeInitialObstacles();
    }

    async load() {
        await this.assetManager.loadAssets(Constants.ASSETS);
    }

    run() {
        /*
			Want to keep running this function on every animation frame, but no
			need to update the game window if we're paused.
		*/
        if (!this.paused) {
            this.canvas.clearCanvas();

            this.updateGameWindow();
            this.drawGameWindow();
        }

        requestAnimationFrame(this.run.bind(this));
    }

    /**
     * startGameTimer
     *
     * This function keeps track of the amount of time that has passed on a "timer"
     * class property.
     *
     * Also kicks off the rhino chase once the timer has passed the rhino start time.
     *
     */
    startGameTimer() {
        let timer = 0;
        const timerInterval = setInterval(() => {
            this.timer = timer++;

            if (this.gameOver) {
                clearInterval(timerInterval);
            } else if (this.timer > Constants.RHINO_CHASE_START_TIME && !this.rhino.chasing) {
                const skierPosition = this.skier.getPosition();
                this.rhino.startChase(skierPosition);
            }
        }, Constants.TIMER_DURATION);
    }

    updateGameWindow() {
        // No need to move skier if game is over.
        if (!this.gameOver) {
            this.skier.move();

            const previousGameWindow = this.gameWindow;
            this.calculateGameWindow();

            /*
				This check fixes bug where previousGameWindow was intermittently null
				and causing the game to crash.
			*/
            if (previousGameWindow) {
                this.obstacleManager.placeNewObstacle(this.gameWindow, previousGameWindow);
            }

            this.skier.checkIfSkierHitObstacle(this.obstacleManager, this.assetManager);
        }

        /* 
			If the rhino is chasing the skier and hasn't caught up yet, we need to update
			the rhino's position.
		*/
        if (this.rhino.chasing && !this.rhino.caughtSkier) {
            const skierPosition = this.skier.getPosition();
            this.rhino.chaseSkier(skierPosition);
            this.rhino.checkIfRhinoCaughtSkier(this.assetManager, this.skier);
        }
    }

    drawGameWindow() {
        this.canvas.setDrawOffset(this.gameWindow.left, this.gameWindow.top);

        // Not drawing the skier once caught, as the rhino eating animation takes over.
        if (!this.rhino.caughtSkier) {
            this.skier.draw(this.canvas, this.assetManager);
        }

        this.obstacleManager.drawObstacles(this.canvas, this.assetManager);

        this.rhino.draw(this.canvas, this.assetManager);

        // Added a progress timer to the top-right of the game window.
        this.canvas.fillText(String(this.timer).padStart(6, "0"), 30, this.gameWindow.right - 150, this.gameWindow.top + 50);

        // Added some "game over" messaging.
        if (this.gameOver) {
            this.canvas.fillText("Game Over", 50, this.gameWindow.left + 100, this.gameWindow.bottom - 150);
            this.canvas.fillText("Press any key to restart", 25, this.gameWindow.left + 100, this.gameWindow.bottom - 100);
        }
    }

    calculateGameWindow() {
        const skierPosition = this.skier.getPosition();
        const left = skierPosition.x - Constants.GAME_WIDTH / 2;
        const top = skierPosition.y - Constants.GAME_HEIGHT / 2;

        this.gameWindow = new Rect(left, top, left + Constants.GAME_WIDTH, top + Constants.GAME_HEIGHT);
    }

    /**
     * pauseGame
     *
     * Simply a function to update the game's "paused" state
     * to be used elsewhere.
     */
    pauseGame() {
        this.paused = !this.paused;
    }

    /**
     * endGame
     *
     * Function that updates the "gameOver" state, and removes
     * the keydown event listener.
     */
    endGame() {
        this.gameOver = true;
        document.removeEventListener("keydown", this.boundHandleKeyDown);
    }

    handleKeyDown(event) {
        switch (event.which) {
            case Constants.KEYS.LEFT:
                this.skier.turnLeft();
                event.preventDefault();
                break;
            case Constants.KEYS.RIGHT:
                this.skier.turnRight();
                event.preventDefault();
                break;
            case Constants.KEYS.UP:
                this.skier.turnUp();
                event.preventDefault();
                break;
            case Constants.KEYS.DOWN:
                this.skier.turnDown();
                event.preventDefault();
                break;
            case Constants.KEYS.SPACE:
                this.skier.jump();
                event.preventDefault();
                break;
            case Constants.KEYS.ENTER:
                this.pauseGame();
                event.preventDefault();
                break;
        }
    }
}
