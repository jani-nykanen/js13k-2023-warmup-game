import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";
import { Player } from "./player.js";


const DEATH_TIME = 15;


export class Coin extends GameObject {


    private deathTimer : number = 0;


    constructor() {

        super(0, 0, false);

        this.hitbox = new Vector(12, 12);
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {

        const ANIM_SPEED = 6;

        this.spr.animate(0, 3, ANIM_SPEED, event.delta);
    };


    protected updatePhysicsEvent(baseSpeed : number, event : CoreEvent) : void {
        
        if (this.pos.y - 8 > event.screenHeight) {

            this.exist = false;
        }
    }


    protected die(event: CoreEvent) : boolean {
        
        return (this.deathTimer += event.delta) >= DEATH_TIME;
    }


    public spawn(x : number, y : number) : void {

        this.pos = new Vector(x, y);
        this.renderPos = this.pos.clone();
        this.spr.setFrame(0);

        this.dying = false;
        this.exist = true;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        const SOURCE_X = [0, 16, 24, 16];
        const SOURCE_W = [16, 8, 8, 8];
        const DEATH_RING_RADIUS = 16;

        if (!this.exist)
            return;

        let t : number;
        if (this.dying) {

            t = this.deathTimer / DEATH_TIME;

            canvas.setAlpha();
            canvas.fillColor("#ffff55");
            canvas.fillRing(this.renderPos.x, this.renderPos.y, 
                t*t*DEATH_RING_RADIUS, t*DEATH_RING_RADIUS);    

            return;
        }

        let frame = this.spr.getFrame();
        let sx = SOURCE_X[frame];
        let sw = SOURCE_W[frame];

        let px = Math.round(this.renderPos.x) - sw/2;
        let py = Math.round(this.renderPos.y) - 8;

        canvas.setFlag("flip", frame == 3 ? Flip.Horizontal : Flip.None);
        canvas.drawBitmap(bmp, px, py, sx, 16, sw, 16);
        canvas.resetFlags();
    }


    public playerCollision(player : Player, event : CoreEvent) : boolean {

        if (!this.exist || this.dying || player.isDying() || !player.doesExist())
            return false;

        if (this.doesOverlay(player)) {

            this.dying = true;
            this.deathTimer = 0.0;
            return true;
        }
        return false;
    }
}
