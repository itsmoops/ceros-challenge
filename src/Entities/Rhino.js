import * as Constants from "../Constants";
import { Entity } from "./Entity";
import { intersectTwoRects } from "../Core/Utils";

/**
 * I created a new Rhino Entity, which follows a lot of the patterns already established
 * in the Skier class.
 *
 * This class keeps track of two main pieces of state, "chasing" and "caughtSkier" which
 * are used at the Game level to make decisions about whether or not to paint certain
 * assets.
 *
 */
export class Rhino extends Entity {
    assetName = Constants.RHINO_RUN_LEFT_1;

    direction = Constants.RHINO_DIRECTIONS.LEFT_1;
    speed = Constants.RHINO_STARTING_SPEED;
    chasing = false;
    caughtSkier = false;

    constructor({ x, y, game }) {
        super(x, y);

        this.game = game;
    }

    setDirection(direction) {
        this.direction = direction;
        this.updateAsset();
    }

    updateAsset() {
        this.assetName = Constants.RHINO_DIRECTION_ASSETS[this.direction];
    }

    /**
     * startChase
     *
     * This function sets the rhino's initial position, just outside of the bounds
     * of the game window.
     *
     * Also has a run animation interval that swaps the rhino running assets while
     * the chase is happening.
     *
     * @param {Object} skierCoordinates
     */
    startChase({ x: skierX, y: skierY } = {}) {
        this.chasing = true;
        this.x = skierX + Constants.RHINO_OFFSET_X;
        this.y = skierY + Constants.RHINO_OFFSET_Y;

        const runAnimation = setInterval(() => {
            if (this.chasing) {
                if (this.assetName === Constants.RHINO_RUN_LEFT_1) {
                    this.setDirection(this.direction + 1);
                } else if (this.assetName === Constants.RHINO_RUN_LEFT_2) {
                    this.setDirection(this.direction - 1);
                }
            } else {
                this.setDirection(0);
                clearInterval(runAnimation);
            }
        }, Constants.ANIMATION_DURATION);
    }

    /**
     * chaseSkier
     *
     * This function moves the rhino ever closer towards the skier. I added the
     * SKIER_PROXIMITY_TOLERANCE functionality to prevent some animation jittering
     * that was occurring as the rhino's "Y" coordinate was rapidly changing.
     *
     * @param {Object} skierCoordinates
     */
    chaseSkier({ x: skierX, y: skierY } = {}) {
        const SKIER_PROXIMITY_TOLERANCE = 20;

        if (skierY - this.y < SKIER_PROXIMITY_TOLERANCE) {
            this.y = skierY;
        } else if (this.y < skierY) {
            this.y += this.speed;
        }

        if (this.x > skierX) {
            this.x -= this.speed / Constants.RHINO_DIAGONAL_SPEED_REDUCER;
        } else if (this.x < skierX) {
            this.x += this.speed / Constants.RHINO_DIAGONAL_SPEED_REDUCER;
        }
    }

    /**
     * eatSkier
     *
     * Called once a collision has been detected between the skier and rhino.
     *
     * Kicks off a eating animation that iterates over all of the rhino eating
     * assets.
     */
    eatSkier() {
        this.chasing = false;
        this.caughtSkier = true;

        let eatAssetIdx = 0;
        const eatAnimation = setInterval(() => {
            if (eatAssetIdx < Constants.RHINO_EATING_ASSETS.length) {
                this.assetName = Constants.RHINO_EATING_ASSETS[eatAssetIdx];
                eatAssetIdx++;
            } else {
                this.updateAsset();
                clearInterval(eatAnimation);
            }
        }, Constants.ANIMATION_DURATION);
    }

    /**
     * checkIfRhinoCaughtSkier
     *
     * Very similar to the pattern in the skier class. This function
     * gets the asset bounds of the rhino and skier, and uses the
     * intersectTwoRects utility function to check if there was a collision.
     *
     * If a collision was detected, the eat skier animation is started and
     * it's game over.
     *
     * @param {Object} assetManager
     * @param {Class} skier
     */
    checkIfRhinoCaughtSkier(assetManager, skier) {
        const rhinoAsset = assetManager.getAsset(this.assetName);
        const skierAsset = assetManager.getAsset(skier.assetName);

        const rhinoBounds = this.getAssetBounds(rhinoAsset);
        const skierBounds = skier.getAssetBounds(skierAsset);

        const collision = intersectTwoRects(rhinoBounds, skierBounds);

        if (collision) {
            this.eatSkier();
            this.game.endGame();
        }
    }
}
