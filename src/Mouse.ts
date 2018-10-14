let robot = require('robotjs');

export class Mouse {

    public center() {
        let {width, height}  = robot.getScreenSize();

        robot.moveMouse(width / 2, height / 2);
    }

    public move(x: number, y: number, cb: Function) {
        let interval = setInterval(()=> {
            if(x <= 10 && y <= 10) {
                clearInterval (interval);
                cb();
                return;
            }
            let origin = robot.getMousePos();
            if(x > 10) {
                x -= 10;
                robot.moveMouse(origin.x + 10, origin.y);
            }
            if(y > 10) {
                y -= 10;
                robot.moveMouse(origin.x, origin.y + 10);
            }
        }, 100)
    }
}