import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";


export class Dust extends GameObject {


    private timer : number = 0.0;
    private fadeSpeed : number = 0.0;
    private size : number = 0;
    private color : string = "#ffffff";


    constructor() {

        super(0, 0, false);
    }


    public spawn(x : number, y : number, 
        size : number, fadeSpeed : number, 
        color = "#ffffff") : void {

        this.pos = new Vector(x, y);
        this.pos = this.pos.clone();

        this.size = size;
        this.fadeSpeed = fadeSpeed;
        this.color = color;

        this.timer = 1.0;

        this.exist = true;
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent): void {
        
        if ((this.timer -= this.fadeSpeed * event.step) <= 0) {

            this.exist = false;
            return;
        }
    }


    private drawBase(canvas : Canvas, shiftx = 0, shifty = 0) : void {

        let px = Math.round(this.pos.x) + shiftx;
        let py = Math.round(this.pos.y) + shifty;
        let radius = Math.round(this.timer * this.size / 2);

        canvas.fillColor(this.color);
        canvas.fillCircle(px, py, radius);
    }


    public draw(canvas : Canvas) : void {

        if (!this.exist) 
            return;
            
        if (this.pos.x < 8)
            this.drawBase(canvas, canvas.width);
        else if (this.pos.x >= canvas.width-8)
            this.drawBase(canvas, -canvas.width);
        this.drawBase(canvas);
    }
}
