import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";


// TODO: Pass as an argument to spawn?
const LIFETIME = 120.0;



export class Particle extends GameObject {


    private timer : number = 0.0;

    private size : number = 0;
    private color : string = "#ffffff";


    constructor() {

        super(0, 0, false);

        this.friction.y = 0.25;
    }


    public spawn(x : number, y : number, 
        speedx : number, speedy : number, 
        color = "#ffffff") : void {

        const BASE_GRAVITY = 8.0;
        const BLOOD_MIN_SIZE = 1.0;
        const BLOOD_MAX_SIZE = 4.0;

        this.pos = new Vector(x, y);
        this.pos = this.pos.clone();

        this.speed = new Vector(speedx, speedy);
        this.target = new Vector(speedx, BASE_GRAVITY);

        this.timer = 0.0;

        this.color = color;
        this.size = BLOOD_MIN_SIZE + ((Math.random() * (BLOOD_MAX_SIZE - BLOOD_MIN_SIZE + 1)) | 0);
        
        this.exist = true;
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent): void {
        
        if ((this.timer += event.step) >= LIFETIME) {

            this.exist = false;
            return;
        }

        if (this.pos.y > event.screenHeight+8) {

            this.exist = false;
        }
    }


    public draw(canvas : Canvas) : void {

        if (!this.exist) 
            return;

        let t = Math.max(0, 1.0 - this.timer / LIFETIME);
        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        let diameter = (this.size + 1);

        canvas.setAlpha(t);
        canvas.fillColor(this.color);
        canvas.fillRect(
            px - diameter/2, py - diameter/2,
            diameter, diameter);
        canvas.setAlpha();
    }
}
