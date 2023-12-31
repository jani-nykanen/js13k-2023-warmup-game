import { GameObject, nextObject } from "./gameobject.js";
import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { Bitmap } from "../renderer/bitmap.js";
import { InputState } from "../core/input.js";
import { Dust } from "./dust.js";


const INITIAL_FRICTION = 0.15;


export class Player extends GameObject {


    private flip : Flip = Flip.None;
    private dir : number = 0;

    private ledgeTimer : number = 0;
    private canJump : boolean = false;
    private jumpTimer : number = 0;
    private doubleJump : boolean = false;
    private stomped : boolean = false;
    private fastDropping : boolean = false;
    private stompBonusTimer : number = 0;

    private dust : Array<Dust>;
    private dustTimer : number = 0.0;


    constructor(x = 0, y = 0) {

        super(x, y, true);
    
        this.friction = new Vector(INITIAL_FRICTION, 0.15);
        this.hitbox = new Vector(8, 12);
        this.center.y = 2;

        this.dust = new Array<Dust> ();
    }


    private control(event : CoreEvent) : void {

        const BASE_SPEED = 1.5;
        const BASE_GRAVITY = 2.0;
        const JUMP_TIME = 20;
        const DOUBLE_JUMP_TIME = 12;
        const STOMP_JUMP_BONUS = 8;
        const FAST_DROP_SPEED = 4.0;
        const JUMP_VOLUME = 0.70;

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
        let jumpButtonState = event.input.getAction("jump");

        let sJump = event.getSample("jump");

        if (!this.fastDropping && 
            fastDropButtonState == InputState.Pressed &&
            !this.canJump) {

            this.fastDropping = true;
            this.stomped = false;
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

        // TODO: This is a mess
        if (this.stomped) {
            
            if ((jumpButtonState & InputState.DownOrPressed) == 1) {

                this.jumpTimer += STOMP_JUMP_BONUS;
                this.stomped = false;
                return;
            }
            else if (fastDropButtonState == InputState.Down) {

                this.stompBonusTimer = this.jumpTimer + STOMP_JUMP_BONUS;
                this.jumpTimer = 0;
                this.stomped = false;
            }
        }
        
        if ((this.ledgeTimer > 0 || this.doubleJump) &&
            jumpButtonState == InputState.Pressed) {

            this.jumpTimer = this.ledgeTimer > 0 ? JUMP_TIME : DOUBLE_JUMP_TIME;
            this.canJump = false

            this.doubleJump = this.ledgeTimer > 0;
            this.ledgeTimer = 0;

            event.audio.playSample(sJump, JUMP_VOLUME);
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

                this.spr.animate(6, 9, DOUBLE_JUMP_ANIM_SPEED, event.step);
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
            this.spr.animate(1, 4, animSpeed, event.step);
        }
    }


    private updateTimers(baseSpeed : number, event : CoreEvent) : void {

        const JUMP_SPEED = 2.0;

        if (this.jumpTimer > 0) {

            this.speed.y = -(JUMP_SPEED + baseSpeed);
            this.jumpTimer -= event.step;

            if (this.jumpTimer <= 0) {

                this.stomped = false;
            }
        }

        if (this.stompBonusTimer > 0) {

            this.speed.y = -(JUMP_SPEED + baseSpeed);
            if ((this.stompBonusTimer -= event.step) <= 0) {

                this.stomped = false;
            }
        }

        if (this.ledgeTimer > 0) {

            this.ledgeTimer -= event.step;
        }
    }


    private updateDust(baseSpeed : number, event : CoreEvent) : void {

        const DUST_TIME = 4;
        const Y_OFF = 6;
        const DUST_SPEED = 1.0/24.0;
        const DUST_BASE_SIZE = 10;
        const EPS = 0.01;

        for (let d of this.dust) {

            d.update(baseSpeed, event);
        }

        if (this.canJump && Math.abs(this.speed.x) < EPS)
            return;

        if ((this.dustTimer += event.step) >= DUST_TIME) {

            this.dustTimer -= DUST_TIME;

            nextObject<Dust>(this.dust, Dust).spawn(
                this.pos.x, this.pos.y + Y_OFF,
                DUST_BASE_SIZE, DUST_SPEED, "#ffffaa");
        }
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {
        
        this.control(event);
        this.updateTimers(baseSpeed, event);
        this.animate(event);
        this.updateDust(baseSpeed, event);

        if (this.pos.x < 0)
            this.pos.x += event.screenWidth;
        else if (this.pos.x > event.screenWidth)
            this.pos.x -= event.screenWidth;

        if (this.pos.y > event.screenHeight+8) {

            this.kill(this.pos.x, event);
        }

        this.canJump = false;
    }

    
    protected floorCollisionEvent(event : CoreEvent, special : boolean) : void {

        const LEDGE_TIME = 8;
        const STOMP_JUMP = 8;

        this.stomped = special;
        this.fastDropping = false;
        this.doubleJump = true;

        if (special) {

            this.jumpTimer = STOMP_JUMP;
            return;
        }

        this.canJump = true;
        this.ledgeTimer = LEDGE_TIME;
    };


    protected die(baseSpeed : number, event : CoreEvent) : boolean {

        const ANIM_SPEED = 4;
        const DEATH_GRAVITY = 8.0;

        this.spr.animate(0, 3, ANIM_SPEED, event.step);
        this.target.y = DEATH_GRAVITY;

        for (let d of this.dust) {

            d.update(baseSpeed, event);
        }

        return this.pos.y >= event.screenHeight+8;
    }


    private drawBase(canvas : Canvas, bmp : Bitmap, shiftx = 0, shifty = 0) : void {

        const SOURCE_TOP_X = [32, 0, 0, 0, 0, 0];
        const SOURCE_BOTTOM_X = [32, 16, 32, 16, 32, 0];
        const SOURCE_TOP_Y = [16, 32, 32, 32, 32, 32];
        const SOURCE_BOTTOM_Y = [24, 32, 32, 40, 40, 40];

        let frame = this.spr.getFrame();
        let px = Math.round(this.pos.x) - 8 + shiftx;
        let py = Math.round(this.pos.y) - 8 + 1 + shifty;
        let rot : number;
        canvas.setFlippingFlag(this.flip);

        if (this.dying) {

            canvas.setRotation( this.spr.getFrame());
            canvas.drawBitmap(bmp, px, py, 32, 16, 16, 16);
            canvas.resetFlags();
            return;
        }

        if (frame >= 6) {

            rot = frame - 6;
            if (this.flip == Flip.Horizontal)
                rot = 3 - rot;

            canvas.setRotation( rot) ;
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


    public drawBottomLayer(canvas : Canvas) : void {

        if (!this.exist)
            return;

        for (let d of this.dust) {

            d.draw(canvas);
        }
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        if (!this.exist)
            return;

        if (this.pos.x < 8)
            this.drawBase(canvas, bmp, canvas.width);
        else if (this.pos.x >= canvas.width-8)
            this.drawBase(canvas, bmp, -canvas.width);

        this.drawBase(canvas, bmp);
    }


    public kill(x : number, event : CoreEvent) : void {

        const SPEED_FACTOR = 0.25;
        const JUMP = -4.0;

        this.dying = true;
        this.spr.setFrame(0);

        this.speed.x = (this.pos.x - x) * SPEED_FACTOR;
        this.speed.y = JUMP;
        this.target.x = 0.0;

        // TODO: Remember to reset this
        this.friction.x = 0.025;

        event.audio.playSample(event.getSample("die"), 0.70);
    }


    public respawn(x : number, y : number) : void {

        this.flip = Flip.None;
        this.dir = 0;

        this.ledgeTimer = 0;
        this.canJump = false;
        this.jumpTimer = 0;
        this.doubleJump = false;
        this.stomped = false;
        this.fastDropping = false;
        this.stompBonusTimer = 0;

        this.pos = new Vector(x, y);
        this.speed = new Vector();
        this.target = new Vector();

        this.exist = true;
        this.dying = false;

        this.spr.setFrame(0);

        this.friction.x = INITIAL_FRICTION;

        this.dustTimer = 0.0;
        for (let d of this.dust) {

            d.forceDead();
        }
    }
}
