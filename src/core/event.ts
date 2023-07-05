import { ActionMap, Input } from "./input.js";



export class CoreEvent {


    private frameStep : number;
    private frameDelta : number = 1.0;

    public readonly input : Input;


    public get step() : number {

        return this.frameStep;
    }


    public get delta() : number {

        return this.frameDelta;
    }


    constructor(physicsStep : number, actions : ActionMap) {

        this.input = new Input(actions);

        this.frameStep  = physicsStep;
    }


    public setDelta(time : number) : void {

        const COMPARE = 1.0/60.0;

        this.frameDelta = time / COMPARE;
    }

}
