import { Vector } from "../common/vector.js";
import { Sprite } from "../renderer/sprite.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";


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


    private updateSpeedAxis(speed : number, target : number, step : number) : number {

        if (speed < target) {

            return Math.min(target, speed + step);
        }
        return Math.max(target, speed - step);
    }


    protected updateEvent(event : CoreEvent) : void {};
    protected updatePhysicsEvent(event : CoreEvent) : void {};


    public update(baseSpeed : number, event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.renderPos.x = this.pos.x + this.speed.x * event.delta;
        this.renderPos.y = this.pos.y + (this.speed.y + baseSpeed) * event.delta;

        this.updateEvent(event);
    }


    public updatePhysics(baseSpeed : number, event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.updatePhysicsEvent(event);

        this.speed.x = this.updateSpeedAxis(
            this.speed.x, this.target.x, 
            this.friction.x*event.step);
        this.speed.y = this.updateSpeedAxis(
            this.speed.y, this.target.y, 
            this.friction.y*event.step);

        this.pos.x += this.speed.x * event.step;
        this.pos.y += (this.speed.y + baseSpeed) * event.step;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {}


    public doesExist = () : boolean => this.exist;
}


export function nextObject<T extends GameObject> (arr : T[], type : Function) : T {

    for (let o of arr) {

        if (!o.doesExist())
            return o;
    }
    return arr[arr.push(new type.prototype.constructor())-1];
}
