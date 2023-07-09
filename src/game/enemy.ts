import { Vector } from "../common/vector.js";
import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";


export const enum EnemyType {

    MovingGroundEnemy = 0,
    JumpingGroundEnemy = 1,
    FlyingEnemy = 2,
    Bullet = 3
};


export class Enemy extends GameObject {


    private enemyType : EnemyType;
    private flip : Flip = Flip.None;

    private leftBorder : number;
    private rightBorder : number;
    private dir : number = 0;


    constructor() {

        super(0, 0, false);
    }


    protected updateEvent(baseSpeed : number, event : CoreEvent) : void {

        const ANIM_BASE_SPEED = 6;

        switch (this.enemyType) {

        case EnemyType.MovingGroundEnemy:

            this.spr.animate(0, 1, (ANIM_BASE_SPEED - baseSpeed*2) | 0, event.delta);
            break;

        default:
            break;
        }
    };


    protected updatePhysicsEvent(baseSpeed : number, event : CoreEvent) : void {
        
        const SPEED_MOD = 0.5;

        if (this.pos.y - 8 > event.screenHeight) {

            this.exist = false;
            return;
        }

        switch (this.enemyType) {
        case EnemyType.MovingGroundEnemy:

            this.speed.x = baseSpeed * SPEED_MOD * this.dir;
            this.target.x = this.speed.x;
            this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
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


    public spawn(x : number, y : number, type : EnemyType,
        leftBorder = x, rightBorder = x) : void {

        this.pos = new Vector(x, y);
        this.renderPos = this.pos.clone();
        this.spr.setFrame(0);

        this.enemyType = type;

        this.leftBorder = leftBorder;
        this.rightBorder = rightBorder;

        if (type != EnemyType.JumpingGroundEnemy) {

            this.dir = Math.random() < 0.5 ? -1 : 1;
            this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
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
        let py = Math.round(this.renderPos.y) - 8; // +1 ???

        canvas.setFlag("flip", this.flip);
        switch (this.enemyType) {

            case EnemyType.MovingGroundEnemy:
    
                sx = frame == 0 ? 16 : 32;
                sy = frame == 0 ? 56 : 48;

                canvas.drawBitmap(bmp, px, py, 16, 48, 16, 8);
                canvas.drawBitmap(bmp, px, py+8, sx, sy, 16, 8);

                break;
    
            default:
                break;
        }

        canvas.resetFlags();
    }
}
