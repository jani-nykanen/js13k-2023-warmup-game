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

        this.event = new CoreEvent(physicsStep, actions);
        this.canvas = new Canvas(canvasWidth, canvasHeight);
    }


    private loop(ts : number) : void {

        const MAX_REFRESH_COUNT = 5; // Needed in the case that window gets deactivate and reactivated much later
        const FRAME_TIME = 16.66667;

        const delta = Math.min(ts - this.oldTime, FRAME_TIME * MAX_REFRESH_COUNT);

        this.event.setDelta(delta);

        this.timeSum += delta;
        this.oldTime = ts;

        // TODO: Call this after everything is loaded
        if (!this.initialized) {

            this.mainProgram?.init(this.event);
            this.initialized = false;
        }

        this.mainProgram?.update(this.event);

        for (; this.timeSum >= FRAME_TIME; this.timeSum -= FRAME_TIME) {

            this.mainProgram?.updatePhysics(this.event);
        }
        this.event.input.update();
        
        this.canvas.clear(rgb(170, 170, 170)); // TODO: Remove
        this.mainProgram?.redraw(this.canvas);

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public run(programType : Function | undefined) : void {

        if (programType != undefined) {

            this.mainProgram = new programType.prototype.constructor(this.event);
        }

        this.loop(0.0);
    }
}
