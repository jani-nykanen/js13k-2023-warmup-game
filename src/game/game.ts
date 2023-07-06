import { CoreEvent } from "../core/event.js";
import { Program } from "../core/program.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { rgb } from "../renderer/color.js";
import { loadAndProcessBitmaps } from "./assets.js"
import { Stage } from "./stage.js";


export class Game implements Program {


    private stage : Stage;


    constructor(event : CoreEvent) {

        loadAndProcessBitmaps(event);
    }


    public init(event : CoreEvent) : void {

        this.stage = new Stage(event.screenWidth);
    }


    public update(event : CoreEvent) : void {

        const MOVE_SPEED = 1.0/15.0;

        this.stage.update(MOVE_SPEED, event);
    }


    public updatePhysics(event : CoreEvent) : void {

    }


    public redraw(canvas : Canvas) : void {

        canvas.clear(rgb(85, 170, 255));

        this.stage.draw(canvas);
    }

}
