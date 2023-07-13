import { Canvas } from "../renderer/canvas.js";
import { CoreEvent } from "./event.js";


export interface Program {
    
    init(event : CoreEvent) : void;
    update(event : CoreEvent) : void;
    redraw(canvas : Canvas) : void;
}
