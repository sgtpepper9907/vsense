let robot = require('robotjs');

export class Mouse {

    public center() {
        let {width, height}  = robot.getScreenSize();

        robot.moveMouse(width / 2, height / 2);
    }

    public translate(x: number, y: number, time: number) {
        return new Promise((resolve) => {
            let step = 5;
            let delay = (function(){
                if (x !== 0) {
                    return (time * 1000) / (x / step);
                }
                if (y !== 0) {
                    return (time * 1000) / (y / step);
                }
            }());

            if(x === 0) {
                if (y > 0) {
                let interval = setInterval(() => {
                    let origin = robot.getMousePos();
                    robot.moveMouseSmooth(origin.x, origin.y + step)
                    y -= step;
                    if(y <= 0) {
                        clearInterval(interval)
                        resolve();
                    }
                }, delay);
                }

                if (y < 0) {
                let interval = setInterval(() => {
                    let origin = robot.getMousePos();
                    robot.moveMouseSmooth(origin.x, origin.y - step)
                    y += step;
                    if (y >= 0) {
                        clearInterval(interval)
                        resolve();
                    }
                }, delay);
                }
            }

            if(y === 0) {
                if (x > 0) {
                let interval = setInterval(() => {
                    let origin = robot.getMousePos();
                    robot.moveMouseSmooth(origin.x + step, origin.y)
                    x -= step;
                    if(x <= 0) {
                        clearInterval(interval)
                        resolve();
                    }
                }, delay);
                }

                if (x < 0) {
                let interval = setInterval(() => {
                    let origin = robot.getMousePos();
                    robot.moveMouseSmooth(origin.x - step, origin.y)
                    x += step;
                    if (x >= 0) {
                        clearInterval(interval)
                        resolve();
                    }
                }, delay);
                }
            }
        })
    }

    public move(direction: string, pixels: number, time: number) {
        if (direction === 'up') {
            return this.translate(0, - pixels, time)
        }
        if (direction === 'down') {
            return this.translate(0, pixels, time)
        }
        if (direction === 'left') {
            return this.translate(- pixels, 0, time)
        }
        if (direction === 'right') {
            return this.translate(pixels, 0, time)
        }
    }
}