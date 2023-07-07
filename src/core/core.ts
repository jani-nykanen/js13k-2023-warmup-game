import { Canvas } from "../renderer/canvas.js";
import { rgb } from "../renderer/color.js";
import { CoreEvent } from "./event.js";
import { ActionMap } from "./input.js";
import { Program } from "./program.js";


export class Core {


    private event : CoreEvent;
    private canvas : Canvas;

    private timeSum : number = 0.0;
    private oldTime : number = 0.0;

    private mainProgram : Program | undefined = undefined;
    private initialized : boolean = false;


    constructor(canvasWidth : number, canvasHeight : number, 
        physicsStep : number, actions : ActionMap) {

        this.canvas = new Canvas(canvasWidth, canvasHeight);
        this.event = new CoreEvent(physicsStep, actions, this.canvas);
    }


    private loop(ts : number) : void {

        const MAX_REFRESH_COUNT = 5; // Needed in the case that window gets deactivated and reactivated much later
        const FRAME_TIME = 16.66667;

        const delta = Math.min(ts - this.oldTime, FRAME_TIME * MAX_REFRESH_COUNT);
        const loaded = this.event.hasLoaded();

        this.event.setDelta(delta / FRAME_TIME);

        this.timeSum += delta;
        this.oldTime = ts;

        this.event.setInterpolationStep((this.timeSum % FRAME_TIME) / FRAME_TIME);

        if (loaded && !this.initialized) {

            this.mainProgram?.init(this.event);
            this.initialized = true;
        }

        if (loaded) 
            this.mainProgram?.update(this.event);

        for (; this.timeSum >= FRAME_TIME; this.timeSum -= FRAME_TIME) {

            if (loaded) 
                this.mainProgram?.updatePhysics(this.event);
        }
        this.event.input.update();
        
        if (loaded) {
            
            this.mainProgram?.redraw(this.canvas);
        }
        else {

            // TODO: Loading text?
            this.canvas.clear(rgb(0, 85, 170));
        }

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public run(programType : Function | undefined) : void {

        if (programType != undefined) {

            this.mainProgram = new programType.prototype.constructor(this.event);
        }

        this.loop(0.0);
    }
}
