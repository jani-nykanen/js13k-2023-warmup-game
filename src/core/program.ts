import { Canvas } from "../renderer/canvas.js";
import { CoreEvent } from "./event.js";



export type ProgramParam = number | string | undefined;


// TODO: Change name to "Scene" like in my previous program?
// Depends on which one is more descriptive
export interface Program {
    
    init(event : CoreEvent) : void;
    update(event : CoreEvent) : void;
    redraw(canvas : Canvas) : void;
    dispose() : ProgramParam;
}
