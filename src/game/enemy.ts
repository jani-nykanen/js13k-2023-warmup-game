import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { rgb } from "../renderer/color.js";
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


    private enemyType : EnemyType;
    private flip : Flip = Flip.None;

    private leftBorder : number;
    private rightBorder : number;
    private dir : number = 0;

    private specialTimer : number = 0;
    private touchGround : boolean = true;

    private attachedPlatform : Platform | undefined = undefined;


    constructor() {

        super(0, 0, false);

        this.friction.y = 0.10;
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {

        const ANIM_BASE_SPEED = [0, 6, 10, 0, 0];
        const WAVE_SPEED = Math.PI*2 / 60;
        const WAVE_AMPLITUDE = 2;
        const JUMP_FRAME_EPS = 0.5;

        switch (this.enemyType) {

        case EnemyType.FlyingEnemy:

            this.specialTimer = (this.specialTimer + WAVE_SPEED * event.delta) % (Math.PI*2); 
            this.renderOffset.y = Math.round(Math.sin(this.specialTimer) * WAVE_AMPLITUDE);

        case EnemyType.MovingGroundEnemy:

            this.spr.animate(0, 1, (ANIM_BASE_SPEED[this.enemyType as number] - baseSpeed*2) | 0, event.delta);
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

        let maxY = this.attachedPlatform?.getPosition();
        if (this.renderPos.y+8 > maxY) {

            this.renderPos.y = maxY - 8;
        }
    };


    protected updatePhysicsEvent(baseSpeed : number, event : CoreEvent) : void {
        
        const SPEED_MOD = [0.0, 0.5, 0.33, 0.0, 0.0];
        const JUMP_WAIT = 30;
        const JUMP_HEIGHT = -2.5;
        const GRAVITY = 4.0;
        // TODO: Tempoprary (but a permanent typo, it seems)
        const MARGIN = 16;

        let p = this.attachedPlatform?.getPosition() - 8;

        if (this.pos.y - 8 > event.screenHeight) {

            this.exist = false;
            return;
        }

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


    public spawn(x : number, platform : Platform, type : EnemyType,
        leftBorder = x, rightBorder = x) : void {

        const OFFSET = [0, -8, -PLATFORM_OFFSET/2 + 8, -8, 0];

        this.pos = new Vector(x, platform.getPosition() + OFFSET[type as number]);
        this.renderPos = this.pos.clone();
        this.renderOffset.zero();
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
        else {

            this.pos.y += 1;
        }

        this.exist = true;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        if (!this.exist)
            return;

        let frame = this.spr.getFrame();
        let sx : number;
        let sy : number;

        let px = Math.round(this.renderPos.x) - 8;
        let py = Math.round(this.renderPos.y) - 8;

        canvas.setFlag("flip", this.flip);
        switch (this.enemyType) {

            case EnemyType.MovingGroundEnemy:
    
                sx = frame == 0 ? 16 : 32;
                sy = frame == 0 ? 56 : 48;

                canvas.drawBitmap(bmp, px, py+1, 16, 48, 16, 8);
                canvas.drawBitmap(bmp, px, py+9, sx, sy, 16, 8);

                break;

            case EnemyType.FlyingEnemy:

                sy = frame == 0 ? 64 : 72;
                canvas.drawBitmap(bmp, px, py+4, 0, sy, 16, 8);
                break;
    
            case EnemyType.JumpingGroundEnemy:

                canvas.fillColor(rgb(0, 0, 0));

                // Body
                canvas.drawBitmap(bmp, px, py+2, 32, 64, 16, 16);

                py += (frame-1);

                // Eye balls
                canvas.drawBitmap(bmp, px, py+4, 32, 56, 16, 8);
                // Nose
                canvas.drawBitmap(bmp, px+4, py+7, 24, 8, 8, 8);

                // Pupils
                py += (frame-1);
                canvas.fillRect(px+5, py+8, 1, 1);
                canvas.fillRect(px+10, py+8, 1, 1);

                break;

            default:
                break;
        }

        canvas.resetFlags();
    }


    public playerCollision(player : Player, moveSpeed : number, event : CoreEvent) : boolean {

        const STOMP_W = 20;
        const STOMP_Y = -6;

        if (!this.exist || !player.doesExist())
            return false;

        if (player.floorCollision(
            this.pos.x + this.center.x - STOMP_W/2, 
            this.pos.y + STOMP_Y, 
            STOMP_W, moveSpeed, event, true, -1.0)) {

            this.exist = false;
            return true;
        }

        // TODO: Kill player
        if (player.doesOverlay(this)) {

            return true;
        }
        return false;
    }
}
