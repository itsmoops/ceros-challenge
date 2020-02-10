import { Rect } from "../Core/Utils";

export class Entity {
    x = 0;
    y = 0;

    assetName = "";

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getAssetName() {
        return this.assetName;
    }

    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

    /**
     * getAssetBounds
     *
     * I moved this logic into an Entity level class function, as it was being used
     * in several locations.
     *
     * @param {Object} asset
     */
    getAssetBounds(asset) {
        return new Rect(
            this.x - asset.width / 2,
            this.y - asset.height / 2,
            this.x + asset.width / 2,
            this.y - asset.height / 4
        );
    }

    draw(canvas, assetManager) {
        const asset = assetManager.getAsset(this.assetName);
        const drawX = this.x - asset.width / 2;
        const drawY = this.y - asset.height / 2;

        canvas.drawImage(asset, drawX, drawY, asset.width, asset.height);
    }
}
