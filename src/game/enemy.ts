import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";
import { Platform } from "./platform.js";
import { Player } from "./player.js";
import { PLATFORM_OFFSET } from "./stage.js";


export const enum EnemyType {

    Unknown = 0,
    MovingGroundEnemy = 1,
    FlyingEnemy = 2,
    JumpingGroundEnemy = 3,
    Bullet = 4
};


export class Enemy extends GameObject {


    private yoffset : number = 0;

    private enemyType : EnemyType = EnemyType.Unknown;
    private flip : Flip = Flip.None;

    private leftBorder : number = 0;
    private rightBorder : number = 0;
    private dir : number = 0;

    private specialTimer : number = 0;
    private touchGround : boolean = true;

    private harmless : boolean = false;

    private attachedPlatform : Platform | undefined = undefined;


    constructor() {

        super(0, 0, false);

        this.friction.y = 0.10;
        this.hitbox = new Vector(8, 8);
    }


    protected die(baseSpeed : number, event : CoreEvent) : boolean {

        const GRAVITY = 6.0;

        this.target.y = GRAVITY;

        return this.pos.y - 8 > event.screenHeight;
    }


    private animate(baseSpeed : number, event : CoreEvent) : void {

        const ANIM_BASE_SPEED = [0, 6, 10, 0, 4];
        const WAVE_SPEED = Math.PI*2 / 60;
        const WAVE_AMPLITUDE = 2;
        const JUMP_FRAME_EPS = 0.5;

        switch (this.enemyType) {

        case EnemyType.FlyingEnemy:

            this.specialTimer = (this.specialTimer + WAVE_SPEED * event.step) % (Math.PI*2); 
            this.yoffset = Math.round(Math.sin(this.specialTimer) * WAVE_AMPLITUDE);
            // Fallthrough
        case EnemyType.MovingGroundEnemy:

            this.spr.animate(0, 1, (ANIM_BASE_SPEED[this.enemyType as number] - baseSpeed*2) | 0, event.step);
            break;

        case EnemyType.Bullet:

            // No base speed modifier for this one
            this.spr.animate(0, 1, ANIM_BASE_SPEED[4], event.step);
            break;

        case EnemyType.JumpingGroundEnemy:

            this.spr.setFrame(1);
            if (!this.touchGround && Math.abs(this.speed.y) > JUMP_FRAME_EPS) {

                this.spr.setFrame(this.speed.y > 0 ? 2 : 0);
            }
            break;

        default:
            break;
        }
    }


    private updateLogic(baseSpeed : number, event : CoreEvent) : void {

        const SPEED_MOD = [0.0, 0.5, 0.33, 0.0, 0.0];
        const JUMP_WAIT = 30;
        const JUMP_HEIGHT = -2.5;
        const GRAVITY = 4.0;
        // TODO: Tempoprary (but a permanent typo, it seems)
        const MARGIN = 16;
        const BULLET_TARGET_SPEED = 10.0;
        const BULLET_FRICTION_MOD = 0.015;

        let p = this.attachedPlatform?.getPosition() - 8;

        this.harmless = this.pos.y < -8;

        switch (this.enemyType) {

        case EnemyType.FlyingEnemy:
        case EnemyType.MovingGroundEnemy:

            this.speed.x = baseSpeed * SPEED_MOD[this.enemyType as number] * this.dir;
            this.target.x = this.speed.x;
            this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
            break;

        case EnemyType.JumpingGroundEnemy:

            if (this.touchGround) {

                if (this.pos.y >= 0) {

                    if ((this.specialTimer += event.step) >= JUMP_WAIT) {

                        this.speed.y = JUMP_HEIGHT;
                        this.target.y = GRAVITY;
                        this.touchGround = false;
                        this.specialTimer -= JUMP_WAIT;
                    }
                }
            }
            else {

                if (this.speed.y > 0 && 
                    this.pos.y >= p &&
                    this.pos.y < p + MARGIN) {

                    this.pos.y = p;
                    this.speed.zero();
                    this.target.zero();

                    this.touchGround = true;
                }
            }

            break;

        case EnemyType.Bullet:

            if (this.pos.y < -8)
                break;

            if (this.specialTimer > 0) {

                this.harmless = true;

                this.speed.x = 0.0;
                this.specialTimer -= baseSpeed * event.step;
                if (this.specialTimer <= 0) {

                    this.speed.x = 0;
                    this.target.x = BULLET_TARGET_SPEED * this.dir;
                }
            }
            else {

                this.friction.x = BULLET_FRICTION_MOD * (baseSpeed + 1.0);

                if ((this.dir > 0 && this.pos.x >= event.screenWidth+8) ||
                    (this.dir < 0 && this.pos.x < -8)) {

                    this.exist = false;
                }
            }

            break;
            
        default:
            break
        }

        if (this.speed.x < 0 &&
            this.pos.x < this.leftBorder) {

            this.speed.x *= -1;
            this.dir *= -1;
            this.pos.x = this.leftBorder;
        }

        if (this.speed.x > 0 &&
            this.pos.x > this.rightBorder) {

            this.speed.x *= -1;
            this.dir *= -1;
            this.pos.x = this.rightBorder;
        }
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {
        
        if (this.pos.y - 8 > event.screenHeight) {

            this.exist = false;
            return;
        }

        this.updateLogic(baseSpeed, event);
        this.animate(baseSpeed, event);
    }


    public spawn(x : number, platform : Platform, type : EnemyType,
        event : CoreEvent, leftBorder = x, rightBorder = x) : void {

        const OFFSET = [0, -8, -PLATFORM_OFFSET/2 + 8, -8, 0];
        const MAX_WAIT = 150;

        this.pos = new Vector(x, platform.getPosition() + OFFSET[type as number]);
        this.yoffset = 0.0; 
        this.speed.zero();
        this.target.zero();
        this.spr.setFrame(0);

        this.enemyType = type;

        this.leftBorder = leftBorder;
        this.rightBorder = rightBorder;

        this.attachedPlatform = platform;

        this.touchGround = true;

        if (type != EnemyType.JumpingGroundEnemy) {

            this.dir = Math.random() < 0.5 ? -1 : 1;
            this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
        }

        if (type == EnemyType.Bullet) {

            this.specialTimer = (Math.random() * MAX_WAIT) | 0;
            this.pos.x = this.dir > 0 ? -8 : event.screenWidth+8;
            this.pos.y -= PLATFORM_OFFSET/2 - 8;
        }

        this.harmless = false;

        this.exist = true;
        this.dying = false;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        if (!this.exist)
            return;

        let frame = this.spr.getFrame();
        let sx : number;
        let sy : number;

        let px = Math.round(this.pos.x) - 8;
        let py = Math.round(this.pos.y) - 8 + this.yoffset;

        let flip = this.flip;
        let stepy = 0;

        if (this.dying) {

            flip |= Flip.Vertical;
            stepy = 1;
        }

        canvas.setFlippingFlag(flip);
        switch (this.enemyType) {

            case EnemyType.MovingGroundEnemy:
    
                sx = frame == 0 ? 16 : 32;
                sy = frame == 0 ? 56 : 48;

                canvas.drawBitmap(bmp, px, py+1 + stepy*8, 16, 48, 16, 8);
                canvas.drawBitmap(bmp, px, py+1 + (1 - stepy)*8, sx, sy, 16, 8);

                break;

            case EnemyType.FlyingEnemy:

                sy = frame == 0 ? 64 : 72;
                canvas.drawBitmap(bmp, px, py+4, 0, sy, 16, 8);
                break;
    
            case EnemyType.JumpingGroundEnemy:

                canvas.fillColor("#000000");

                // Body
                canvas.drawBitmap(bmp, px, py+2, 32, 64, 16, 16);

                py += (frame-1);

                // Eye balls
                canvas.drawBitmap(bmp, px, py + 4 + 5*stepy, 32, 56, 16, 8);
                // Nose
                canvas.drawBitmap(bmp, px+4, py+7-stepy, 24, 8, 8, 8);

                // Pupils
                py += (frame-1) + 4*stepy;
                canvas.fillRect(px+5, py + 8, 1, 1);
                canvas.fillRect(px+10, py + 8, 1, 1);

                break;

            case EnemyType.Bullet:

                canvas.drawBitmap(bmp, px, py + 2 - 4*stepy, 16, 64, 16, 16);
                if (frame == 1 && !this.dying) {

                    canvas.drawBitmap(bmp, px+4 - this.dir*12, py + 4, 40, 8, 8, 8);
                }

                break;

            default:
                break;
        }

        canvas.resetFlags();
    }


    public playerCollision(player : Player, moveSpeed : number, event : CoreEvent) : boolean {

        const STOMP_W = 20;
        const STOMP_Y = -6;
        const DEATH_START_SPEED = 1.0;

        if (!this.exist || !player.doesExist() ||
            this.dying || player.isDying() ||
            this.harmless)
            return false;

        if (player.floorCollision(
            this.pos.x + this.center.x - STOMP_W/2, 
            this.pos.y + STOMP_Y, 
            STOMP_W, moveSpeed, event, true, -1.0)) {

            this.dying = true;
            this.speed.zero();
            this.target.zero();

            this.speed.y = DEATH_START_SPEED;

            event.audio.playSample(event.getSample("kill"), 0.70);

            return true;
        }

        // TODO: Kill player
        if (player.doesOverlay(this)) {

            player.kill(this.pos.x, event);
            return true;
        }
        return false;
    }
}
