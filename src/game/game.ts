import { CoreEvent } from "../core/event.js";
import { Program } from "../core/program.js";
import { Canvas } from "../renderer/canvas.js";
import { rgb } from "../renderer/color.js";
import { loadAndProcessBitmaps } from "./assets.js"


export class Game implements Program {


    constructor(event : CoreEvent) {

        loadAndProcessBitmaps(event);
    }


    public init(event : CoreEvent) : void {

    }


    public update(event : CoreEvent) : void {

    }


    public updatePhysics(event : CoreEvent) : void {

    }


    public redraw(canvas : Canvas) : void {

        canvas.clear(rgb(85, 170, 255));

        canvas.drawBitmap(canvas.getBitmap("test"), 16, 16);
    }

}
