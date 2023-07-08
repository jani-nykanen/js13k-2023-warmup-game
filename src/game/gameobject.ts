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

    protected center : Vector;
    protected hitbox : Vector;

    protected spr : Sprite;

    protected exist : boolean;


    constructor(x = 0, y = 0, exist = false) {

        this.pos = new Vector(x, y);
        this.renderPos = this.pos.clone();
        this.speed = new Vector();
        this.target = new Vector();
        this.friction = new Vector(1.0, 1.0);

        this.center = new Vector();
        this.hitbox = new Vector();

        this.spr = new Sprite();

        this.exist = exist;
    }


    private setCollisionHorizontalBounds(x : number, w : number, event : CoreEvent) : boolean {

        let left: number;
        let right : number;
        
        for (let i = -1; i <= 1; ++ i) {

            left = this.pos.x + this.center.x - this.hitbox.x/2 + event.screenWidth*i;
            right = left + this.hitbox.x + event.screenWidth*i;

            if (right >= x && left < x + w)
                return true;
        }
        return false;
    }


    private updateSpeedAxis(speed : number, target : number, step : number) : number {

        if (speed < target) {

            return Math.min(target, speed + step);
        }
        return Math.max(target, speed - step);
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {};
    protected updatePhysicsEvent(baseSpeed : number, event : CoreEvent) : void {};


    public update(baseSpeed : number, event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.renderPos.x = this.pos.x + this.speed.x * event.delta;
        this.renderPos.y = this.pos.y + (this.speed.y + baseSpeed) * event.delta;

        this.updateEvent(baseSpeed, event);
    }


    public updatePhysics(baseSpeed : number, event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.updatePhysicsEvent(baseSpeed, event);

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


    protected floorCollisionEvent(event : CoreEvent) : void {};


    public floorCollision(x : number, y : number, w : number, 
        moveSpeed : number, event : CoreEvent) : boolean {

        const MARGIN = 2;

        let py1 = this.pos.y + this.center.y + this.hitbox.y/2;
        let py2 = py1 + (this.speed.y + moveSpeed) * event.step;

        if (this.speed.y <= 0 || !this.setCollisionHorizontalBounds(x, w, event))
            return false;

        if (py1 < y + MARGIN && py2 > y - MARGIN) {

            this.pos.y = y - (this.center.y + this.hitbox.y/2);
            this.speed.y = 0;

            this.floorCollisionEvent(event);

            return true;
        }
        return false;
    }


    public doesExist = () : boolean => this.exist;
}


export function nextObject<T extends GameObject> (arr : T[], type : Function) : T {

    for (let o of arr) {

        if (!o.doesExist())
            return o;
    }
    return arr[arr.push(new type.prototype.constructor())-1];
}
