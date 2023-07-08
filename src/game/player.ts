import { GameObject } from "./gameobject.js";
import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { Bitmap } from "../renderer/bitmap.js";
import { InputState } from "../core/input.js";


export class Player extends GameObject {


    private flip : Flip = Flip.None;
    private dir : number = 0;

    private ledgeTimer : number = 0;
    private canJump : boolean = false;
    private jumpTimer : number = 0;


    constructor(x = 0, y = 0) {

        super(x, y, true);
    
        this.friction = new Vector(0.15, 0.15);
        this.hitbox = new Vector(8, 12);
        this.center.y = 2;
    }


    private control(event : CoreEvent) : void {

        const BASE_SPEED = 1.0;
        const BASE_GRAVITY = 2.0;
        const JUMP_TIME = 20;

        let dir = 0;
        if ((event.input.getAction("right") & InputState.DownOrPressed) != 0) {

            dir = 1;
        }
        else if ((event.input.getAction("left") & InputState.DownOrPressed) != 0) {

            dir = -1;
        }

        if (dir != 0) {
            
            this.dir = dir;
        }
        this.target.x = BASE_SPEED * dir;
        this.target.y = BASE_GRAVITY;

        let jumpButtonState = event.input.getAction("jump");

        if (this.ledgeTimer > 0 &&
            jumpButtonState == InputState.Pressed) {

            this.ledgeTimer = 0;
            this.jumpTimer = JUMP_TIME;
            this.canJump = false;

            console.log("JUMP!");
        }
        else if ((jumpButtonState & InputState.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }
    }


    private animate(event : CoreEvent) : void {

        const EPS = 0.01;

        let animSpeed : number;
        let sx = Math.abs(this.speed.x);

        if (this.dir != 0) {

            this.flip = this.dir == 1 ? Flip.None : Flip.Horizontal;
        }

        if (!this.canJump) {

            this.spr.setFrame(5);
            return;
        }

        if (sx < EPS) {

            this.spr.setFrame(0);
            this.dir = 0;
        }
        else {

            animSpeed = 10 - sx*4
            this.spr.animate(1, 4, animSpeed, event.delta);
        }
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {

        this.control(event);
        this.animate(event);
    };


    protected updatePhysicsEvent(baseSpeed : number, event : CoreEvent) : void {
        
        const JUMP_SPEED = 2.0;

        if (this.jumpTimer > 0) {

            this.speed.y = -(JUMP_SPEED + baseSpeed);
            this.jumpTimer -= event.step;
        }

        if (this.ledgeTimer > 0) {

            this.ledgeTimer -= event.step;
        }

        // TEMP
        if (this.pos.y > event.screenHeight+8) {

            this.pos.y -= event.screenHeight+16;
        }

        this.canJump = false;
    }

    
    protected floorCollisionEvent(event : CoreEvent) : void {

        const LEDGE_TIME = 8;

        this.canJump = true;

        this.ledgeTimer = LEDGE_TIME;
    };


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        const SOURCE_TOP_X = [32, 0, 0, 0, 0, 0];
        const SOURCE_BOTTOM_X = [32, 16, 32, 16, 32, 0];
        const SOURCE_TOP_Y = [16, 32, 32, 32, 32, 32];
        const SOURCE_BOTTOM_Y = [24, 32, 32, 40, 40, 40];

        if (!this.exist)
            return;

        let frame = this.spr.getFrame();
        let px = Math.round(this.renderPos.x) - 8;
        let py = Math.round(this.renderPos.y) - 8 + 1;

        let noseOffset = 6 + this.dir;
        if (this.flip == Flip.Horizontal)
            noseOffset -= 4;

        canvas.setFlag("flip", this.flip);

        canvas.drawBitmap(bmp, px, py, 
            SOURCE_TOP_X[frame], SOURCE_TOP_Y[frame], 16, 8);
        canvas.drawBitmap(bmp, px, py+8, 
            SOURCE_BOTTOM_X[frame], SOURCE_BOTTOM_Y[frame], 16, 8);   

        // Nose
        canvas.drawBitmap(bmp, px + noseOffset, py + 5, 24, 8, 8, 8);   

        canvas.setFlag("flip", Flip.None);
    }
}
