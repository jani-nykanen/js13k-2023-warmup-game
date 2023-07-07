import { Vector } from "../common/vector.js";
import { Sprite } from "../renderer/sprite.js";
import { CoreEvent } from "../core/event.js";


export class GameObject {


    protected pos : Vector;
    protected renderPos : Vector;
    protected speed : Vector;
    protected target : Vector;
    protected friction : Vector;

    protected hitbox : Vector;

    protected spr : Sprite;

    protected exist : boolean;


    constructor(x = 0, y = 0, exist = false) {

        this.pos = new Vector(x, y);
        this.renderPos = this.pos.clone();
        this.speed = new Vector();
        this.target = new Vector();
        this.friction = new Vector(1.0, 1.0);

        this.spr = new Sprite();

        this.exist = exist;
    }


    protected updateEvent(event : CoreEvent) : void {};
    protected updatePhysicsEvent(event : CoreEvent) : void {};
}
