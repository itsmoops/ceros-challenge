import * as Constants from "../Constants";
import { Entity } from "./Entity";

export class Skier extends Entity {
    assetName = Constants.SKIER_DOWN;

    direction = Constants.SKIER_DIRECTIONS.DOWN;
    speed = Constants.SKIER_STARTING_SPEED;
    jumping = false;

    constructor({ x, y, game }) {
        super(x, y);

        this.game = game;
    }

    setDirection(direction) {
        this.direction = direction;
        this.updateAsset();
    }

    updateAsset() {
        this.assetName = Constants.SKIER_DIRECTION_ASSETS[this.direction];
    }

    /**
     * jump
     *
     * This function updates the jumping class property.
     *
     * It runs a jump animation, which iterates over all of the skier jump
     * assets. Once the animation is complete, the jumping property is set
     * back to false.
     */
    jump() {
        if (!this.jumping) {
            this.jumping = true;

            let jumpAssetIdx = 0;
            const jumpAnimation = setInterval(() => {
                if (jumpAssetIdx < Constants.SKIER_JUMP_ASSETS.length) {
                    this.assetName = Constants.SKIER_JUMP_ASSETS[jumpAssetIdx];
                    jumpAssetIdx++;
                } else {
                    this.jumping = false;
                    this.updateAsset();
                    clearInterval(jumpAnimation);
                }
            }, Constants.ANIMATION_DURATION);
        }
    }

    move() {
        switch (this.direction) {
            case Constants.SKIER_DIRECTIONS.LEFT_DOWN:
                this.moveSkierLeftDown();
                break;
            case Constants.SKIER_DIRECTIONS.DOWN:
                this.moveSkierDown();
                break;
            case Constants.SKIER_DIRECTIONS.RIGHT_DOWN:
                this.moveSkierRightDown();
                break;
        }
    }

    moveSkierLeft() {
        this.x -= Constants.SKIER_STARTING_SPEED;
    }

    moveSkierLeftDown() {
        this.x -= this.speed / Constants.SKIER_DIAGONAL_SPEED_REDUCER;
        this.y += this.speed / Constants.SKIER_DIAGONAL_SPEED_REDUCER;
    }

    moveSkierDown() {
        this.y += this.speed;
    }

    moveSkierRightDown() {
        this.x += this.speed / Constants.SKIER_DIAGONAL_SPEED_REDUCER;
        this.y += this.speed / Constants.SKIER_DIAGONAL_SPEED_REDUCER;
    }

    moveSkierRight() {
        this.x += Constants.SKIER_STARTING_SPEED;
    }

    moveSkierUp() {
        this.y -= Constants.SKIER_STARTING_SPEED;
    }

    turnLeft() {
        /*
            The "snowstorm" bug was caused by the direction property already being set to 0 (crash),
            so when you go to move left, this function calls setDirection with -1. This ends up throwing an
            error when updateAsset attempts to find an asset at an index that doesn't exist in the lookup.

            I fixed this by simply updating the condition to check if the current direction is either left
            or crash, and only updating the direction when those conditions are not met.

            I added unit tests to a new Skier.test.js file to address this bug.
        */
        if (this.direction === Constants.SKIER_DIRECTIONS.LEFT || this.direction === Constants.SKIER_DIRECTIONS.CRASH) {
            this.moveSkierLeft();
        } else {
            this.setDirection(this.direction - 1);
        }
    }

    turnRight() {
        // I applied the same fix here for consistency's sake.
        if (this.direction === Constants.SKIER_DIRECTIONS.RIGHT || this.direction === Constants.SKIER_DIRECTIONS.CRASH) {
            this.moveSkierRight();
        } else {
            this.setDirection(this.direction + 1);
        }
    }

    turnUp() {
        if (this.direction === Constants.SKIER_DIRECTIONS.LEFT || this.direction === Constants.SKIER_DIRECTIONS.RIGHT) {
            this.moveSkierUp();
        }
    }

    turnDown() {
        this.setDirection(Constants.SKIER_DIRECTIONS.DOWN);
    }

    checkIfSkierHitObstacle(obstacleManager, assetManager) {
        const asset = assetManager.getAsset(this.assetName);

        const skierBounds = this.getAssetBounds(asset);

        const collision = obstacleManager.detectCollision(asset, skierBounds);

        /*
            I made some updates here:

            If the asset that the skier collided with is a ramp, the jump
            function is called.

            Otherwise, we check to see if the asset that the skier collided with
            is in our array of safe, "jumpable" assets (in this case, rocks).

            If the asset was not a ramp or a "jumpable" asset, then it's a valid
            crash and the game is over.
        */
        if (collision) {
            const { assetName } = collision;
            const jumpableObstacle = this.jumping && Constants.JUMPABLE_ASSETS.includes(assetName);

            if (assetName === Constants.RAMP) {
                this.jump();
            } else if (!jumpableObstacle) {
                this.setDirection(Constants.SKIER_DIRECTIONS.CRASH);
                this.game.endGame();
            }
        }
    }
}
