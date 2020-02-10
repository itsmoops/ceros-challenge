import "babel-polyfill";
import * as Constants from "../Constants";
import { Skier } from "./Skier";

describe("src/Entities/Skier", () => {
    let skier;

    beforeEach(() => {
        jest.clearAllMocks();

        skier = new Skier(0, 0);
        skier.setDirection = jest.fn();
    });

    describe("turnLeft", () => {
        it("should call setDirection when the skier is turning left and has not crashed", () => {
            skier.turnLeft();

            expect(skier.setDirection).toHaveBeenCalledTimes(1);
            expect(skier.setDirection).toHaveBeenCalledWith(2);
        });

        it("should not call setDirection when the skier is already facing left", () => {
            skier.direction = Constants.SKIER_DIRECTIONS.LEFT;

            skier.turnLeft();

            expect(skier.setDirection).not.toHaveBeenCalled();
            expect(skier.direction).toEqual(Constants.SKIER_DIRECTIONS.LEFT);
        });

        it("should not call setDirection if a collision was detected", () => {
            skier.direction = Constants.SKIER_DIRECTIONS.CRASH;

            skier.turnLeft();

            expect(skier.setDirection).not.toHaveBeenCalled();
            expect(skier.direction).toEqual(Constants.SKIER_DIRECTIONS.CRASH);
        });
    });
});
