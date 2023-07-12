import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";


// TODO: Pass as an argument to spawn?
const LIFETIME = 120.0;



export const enum ParticleType {

    Star = 0,
    Blood = 1,

};


export class Particle extends GameObject {


    private timer : number = 0.0;
    private interpolatedTimer : number = 0.0;

    private type : ParticleType = ParticleType.Star;
    private size : number = 0;


    constructor() {

        super(0, 0, false);

        this.friction.y = 0.25;
    }


    public spawn(x : number, y : number, 
        speedx : number, speedy : number, 
        type = ParticleType.Star) : void {

        const BASE_GRAVITY = 8.0;
        const BLOOD_MIN_SIZE = 1.0;
        const BLOOD_MAX_SIZE = 4.0;

        this.pos = new Vector(x, y);
        this.renderPos = this.pos.clone();

        this.speed = new Vector(speedx, speedy);
        this.target = new Vector(speedx, BASE_GRAVITY);

        this.timer = 0.0;
        this.interpolatedTimer = 0.0;

        this.type = type;
        if (type == ParticleType.Blood) {

            this.size = BLOOD_MIN_SIZE + ((Math.random() * (BLOOD_MAX_SIZE - BLOOD_MIN_SIZE + 1)) | 0);
        }

        this.exist = true;
    }


    protected updateEvent(baseSpeed: number, event: CoreEvent): void {
        
        this.interpolatedTimer = this.timer + event.interpolationStep;
    }


    protected updatePhysicsEvent(baseSpeed : number, event : CoreEvent): void {
        
        if ((this.timer += event.step) >= LIFETIME) {

            this.exist = false;
            return;
        }

        if (this.pos.y > event.screenHeight+8) {

            this.exist = false;
        }
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        if (!this.exist) 
            return;

        let t = Math.max(0, 1.0 - this.interpolatedTimer / LIFETIME);
        let px = Math.round(this.renderPos.x);
        let py = Math.round(this.renderPos.y);
        let diameter = (this.size + 1);

        canvas.setAlpha(t);

        if (this.type == ParticleType.Star) {

            canvas.drawBitmap(bmp,
                px - 4, py - 4,
                40, 8, 8, 8);
        }
        else {

            canvas.fillColor("#aa0000");
            canvas.fillRect(
                px - diameter/2, py - diameter/2,
                diameter, diameter);
        }

        canvas.setAlpha();
    }
}
