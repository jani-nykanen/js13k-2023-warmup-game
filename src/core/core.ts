import { Canvas } from "../renderer/canvas.js";
import { CoreEvent } from "./event.js";
import { ActionMap } from "./input.js";


export class Core {


    private event : CoreEvent;
    private canvas : Canvas;

    private timeSum : number = 0.0;
    private oldTime : number = 0.0;


    constructor(canvasWidth : number, canvasHeight : number, actions : ActionMap) {

        this.canvas = new Canvas(canvasWidth, canvasHeight);
        this.event = new CoreEvent(actions, this.canvas);
    }


    private loop(ts : number) : void {

        const MAX_REFRESH_COUNT = 5; // Needed in the case that window gets deactivated and reactivated much later
        const FRAME_TIME = 16.66667;

        // TODO: Or cap the refresh count, not delta?
        let delta = Math.min(ts - this.oldTime, FRAME_TIME * MAX_REFRESH_COUNT);
        let loaded = this.event.hasLoaded();

        this.timeSum += delta;
        this.oldTime = ts;

        if (loaded) {

            this.event.initializeProgram();
        }

        let firstFrame = true;
        for (; this.timeSum >= FRAME_TIME; this.timeSum -= FRAME_TIME) {

            if (loaded) {

                this.event.updateProgram();
                this.event.transition.update(this.event);
            }
            
            if (firstFrame) {

                this.event.input.update();
                firstFrame = false;
            }
        }
        
        if (loaded) {
            
            this.event.redrawProgram(this.canvas);
            this.event.transition.draw(this.canvas);
        }
        else {

            // TODO: Loading text?
            this.canvas.clear("rgb(0, 85, 170)");
        }

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public run(programType : Function | undefined, 
        initialEvent : ((event : CoreEvent) => void) | undefined = undefined ) : void {

        if (initialEvent != undefined)
            initialEvent(this.event);

        if (programType != undefined) 
            this.event.changeProgram(programType);

        this.loop(0.0);
    }
}
