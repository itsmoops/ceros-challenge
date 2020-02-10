import * as Constants from "../Constants";

export class Canvas {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    drawOffset = {
        x: 0,
        y: 0
    };
    ctx = null;

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.createCanvas();
    }

    /**
     * Decided to dynamically generate a new canvas on every new game,
     * and remove the canvas altogether when the user resets.
     *
     * This prevents any weird issues with a stale canvas from a previous game
     * lingering on the DOM.
     */
    createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.id = Constants.CANVAS_ID;
        canvas.width = this.width * window.devicePixelRatio;
        canvas.height = this.height * window.devicePixelRatio;
        canvas.style.width = this.width + "px";
        canvas.style.height = this.height + "px";
        document.body.append(canvas);

        this.ctx = canvas.getContext("2d");
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    clearCanvas() {
        this.ctx.clearRect(this.x, this.y, this.width, this.height);
    }

    /**
     * removeCanvas
     * 
     * Removes the current game's canvas from the DOM.
     * To be used when resetting the game.
     */
    removeCanvas() {
        const canvas = document.getElementById(Constants.CANVAS_ID);
        document.body.removeChild(canvas);
    }

    setDrawOffset(x, y) {
        this.drawOffset.x = x;
        this.drawOffset.y = y;
    }

    drawImage(image, x, y, width, height) {
        x -= this.drawOffset.x;
        y -= this.drawOffset.y;

        this.ctx.drawImage(image, x, y, width, height);
    }

    /**
     * fillText
     *
     * Helper function to write text to the canvas.
     *
     * @param {String} text
     * @param {Number} size
     * @param {Number} x
     * @param {Number} y
     */
    fillText(text, size, x, y) {
        x -= this.drawOffset.x;
        y -= this.drawOffset.y;

        this.ctx.fillStyle = "grey";
        this.ctx.font = `${size}px monospace`;

        this.ctx.fillText(text, x, y);
    }
}
