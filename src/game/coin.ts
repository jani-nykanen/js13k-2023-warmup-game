import { CoreEvent } from "../core/event.js";
import { GameObject } from "./gameobject.js";


export class Coin extends GameObject {


    constructor() {

        super();
    }


    protected updateEvent(event : CoreEvent) : void {

        const ANIM_SPEED = 4;

        this.spr.animate(0, 3, ANIM_SPEED, event.delta);
    };
}
