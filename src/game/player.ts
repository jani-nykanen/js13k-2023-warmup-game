import { GameObject } from "./gameobject.js";
import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Canvas, Flip, Rotation } from "../renderer/canvas.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Input, InputState } from "../core/input.js";


export class Player extends GameObject {


    private flip : Flip = Flip.None;
    private dir : number = 0;

    private ledgeTimer : number = 0;
    private canJump : boolean = false;
    private jumpTimer : number = 0;
    private doubleJump : boolean = false;
    private stomped : boolean = false;
    private fastDropping : boolean = false;


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
        const DOUBLE_JUMP_TIME = 12;
        const STOMP_JUMP_BONUS = 8;
        const FAST_DROP_SPEED = 4.0;

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

        let fastDropButtonState = event.input.getAction("down");

        if (!this.fastDropping && fastDropButtonState == InputState.Pressed) {

            this.fastDropping = true;
        }

        if (this.fastDropping) {

            if ((fastDropButtonState & InputState.DownOrPressed) == 0) {

                this.fastDropping = false;
            }
            else {

                this.speed.y = FAST_DROP_SPEED;
                this.target.y = FAST_DROP_SPEED;

                this.jumpTimer = 0;
                this.stomped = false;
                return;
            }
        }

        let jumpButtonState = event.input.getAction("jump");

        // TODO: Down press boost does not work yet
        if (this.stomped && 
            ( (jumpButtonState & InputState.DownOrPressed) == 1 ||
              (!this.fastDropping && fastDropButtonState == InputState.Down ) 
            )) {

            this.jumpTimer += STOMP_JUMP_BONUS;
            this.stomped = false;
        }
        else if ((this.ledgeTimer > 0 || this.doubleJump) &&
            jumpButtonState == InputState.Pressed) {

            this.jumpTimer = this.ledgeTimer > 0 ? JUMP_TIME : DOUBLE_JUMP_TIME;
            this.canJump = false

            this.doubleJump = this.ledgeTimer > 0;
            this.ledgeTimer = 0;
        }
        else if (!this.stomped &&
            (jumpButtonState & InputState.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }
    }


    private animate(event : CoreEvent) : void {

        const EPS = 0.01;
        const DOUBLE_JUMP_ANIM_SPEED = 3;
        const DOUBLE_JUMP_ANIM_TRIGGER = -1.0;

        let animSpeed : number;
        let sx = Math.abs(this.speed.x);

        if (this.dir != 0) {

            this.flip = this.dir == 1 ? Flip.None : Flip.Horizontal;
        }

        if (!this.canJump) {

            if (!this.doubleJump && this.speed.y < DOUBLE_JUMP_ANIM_TRIGGER) {

                this.spr.animate(6, 9, DOUBLE_JUMP_ANIM_SPEED, event.delta);
                return;
            }

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

            if (this.jumpTimer <= 0) {

                this.stomped = false;
            }
        }

        if (this.ledgeTimer > 0) {

            this.ledgeTimer -= event.step;
        }

        if (this.pos.x < 0)
            this.pos.x += event.screenWidth;
        else if (this.pos.x > event.screenWidth)
            this.pos.x -= event.screenWidth;

        // TEMP
        if (this.pos.y > event.screenHeight+8) {

            this.pos.y -= event.screenHeight+16;
        }

        this.canJump = false;
    }

    
    protected floorCollisionEvent(event : CoreEvent, special : boolean) : void {

        const LEDGE_TIME = 8;
        const STOMP_JUMP = 8;
        const FAST_DROP_BONUS = 4;

        this.stomped = special;
        this.fastDropping = false;

        if (special) {

            this.jumpTimer = STOMP_JUMP;
            this.doubleJump = true;
            return;
        }

        this.canJump = true;
        this.doubleJump = true;
        this.ledgeTimer = LEDGE_TIME;
    };


    private drawBase(canvas : Canvas, bmp : Bitmap, shiftx = 0, shifty = 0) : void {

        const SOURCE_TOP_X = [32, 0, 0, 0, 0, 0];
        const SOURCE_BOTTOM_X = [32, 16, 32, 16, 32, 0];
        const SOURCE_TOP_Y = [16, 32, 32, 32, 32, 32];
        const SOURCE_BOTTOM_Y = [24, 32, 32, 40, 40, 40];

        if (!this.exist)
            return;

        let frame = this.spr.getFrame();
        let px = Math.round(this.renderPos.x) - 8 + shiftx;
        let py = Math.round(this.renderPos.y) - 8 + 1 + shifty;
        let rot : number;

        canvas.setFlag("flip", this.flip);

        if (frame >= 6) {

            rot = frame - 6;
            if (this.flip == Flip.Horizontal)
                rot = 3 - rot;

            canvas.setFlag("rotation", rot as Rotation) ;
            canvas.drawBitmap(bmp, px, py, 
                0, 48, 16, 16);
            canvas.resetFlags();
            return;
        }

        let noseOffset = 6 + this.dir;
        if (this.flip == Flip.Horizontal)
            noseOffset -= 4;

        canvas.drawBitmap(bmp, px, py, 
            SOURCE_TOP_X[frame], SOURCE_TOP_Y[frame], 16, 8);
        canvas.drawBitmap(bmp, px, py+8, 
            SOURCE_BOTTOM_X[frame], SOURCE_BOTTOM_Y[frame], 16, 8);   

        // Nose
        canvas.drawBitmap(bmp, px + noseOffset, py + 5, 24, 8, 8, 8);   

        canvas.resetFlags();
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        if (this.renderPos.x < 8)
            this.drawBase(canvas, bmp, canvas.width);
        else if (this.renderPos.x >= canvas.width-8)
            this.drawBase(canvas, bmp, -canvas.width);

        this.drawBase(canvas, bmp);
    }
}
