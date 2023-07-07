import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";


export class Coin extends GameObject {


    constructor() {

        super(0, 0, false);
    }


    protected updateEvent(event : CoreEvent) : void {

        const ANIM_SPEED = 6;

        this.spr.animate(0, 3, ANIM_SPEED, event.delta);
    };


    protected updatePhysicsEvent(event : CoreEvent) : void {
        
        if (this.pos.y - 8 > event.screenHeight) {

            this.exist = false;
        }
    }


    public spawn(x : number, y : number) : void {

        this.pos = new Vector(x, y);
        this.renderPos = this.pos.clone();
        this.spr.setFrame(0);

        this.exist = true;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        const SOURCE_X = [0, 16, 24, 16];
        const SOURCE_W = [16, 8, 8, 8];

        if (!this.exist)
            return;

        let frame = this.spr.getFrame();
        let sx = SOURCE_X[frame];
        let sw = SOURCE_W[frame];

        let px = Math.round(this.renderPos.x) - sw/2;
        let py = Math.round(this.renderPos.y) - 8;

        canvas.setFlag("flip", frame == 3 ? Flip.Horizontal : Flip.None);
        canvas.drawBitmap(bmp, px, py, sx, 16, sw, 16);
        canvas.setFlag("flip", Flip.None);
    }
}
