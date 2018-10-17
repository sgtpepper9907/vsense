let robot = require('robotjs');

export class Mouse {

    public center() {
        let {width, height}  = robot.getScreenSize();

        robot.moveMouse(width / 2, height / 2);
    }

    public move(x: number, y: number) {
        let origin = robot.getMousePos();
        robot.moveMouseSmooth(origin.x + x, origin.y + y);
    }
}