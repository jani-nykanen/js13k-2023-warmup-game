import { CoreEvent } from "../core/event.js";
import { Canvas } from "../renderer/canvas.js";
import { Platform } from "./platform.js";
import { Coin } from "./coin.js";
import { nextObject } from "./gameobject.js";
import { Player } from "./player.js";
import { Enemy, EnemyType } from "./enemy.js";


export const PLATFORM_OFFSET = 48;


export class Stage {


    private platforms : Platform[];
    private enemies : Enemy[];
    private coins : Coin[];
    
    private player : Player;


    constructor(event : CoreEvent) {

        this.platforms = new Array<Platform> ();
        for (let y = 0; y < 5; ++ y) {

            this.platforms[y] = new Platform(y*PLATFORM_OFFSET, (event.screenWidth/16) | 0);
        }
        
        this.coins = new Array<Coin> ();
        this.enemies = new Array<Enemy> ();
    
        this.player = new Player(event.screenWidth/2, event.screenHeight/2);
    }


    private spawnCoins(platform : Platform, event : CoreEvent) : void {

        let w = (event.screenWidth / 16) | 0;
        let x = (Math.random() * w) | 0;

        nextObject<Coin>(this.coins, Coin).spawn(
            x*16 + 8, 
            platform.getPosition() - PLATFORM_OFFSET/2 + 8);
    }


    private computeEnemyMoveRange(platform : Platform, dx : number, w : number) : [number, number] {

        let left : number;
        let right :  number;
        
        for (left = dx; left >= 0; -- left) {

            if (platform.getTile(left) == 0 ||
                platform.hasSpike(left)) {

                break;
            }
        }

        for (right = dx; right <= w-1; ++ right) {

            if (platform.getTile(right) == 0 ||
                platform.hasSpike(right)) {

                break;
            }
        }
        return [left, right];
    }


    private spawnEnemy(platform : Platform, event : CoreEvent) : void {

        const PROB = [0.50, 0.25, 0.25];

        let p = Math.random();
        let v = PROB[0];
        let i : number;

        let left : number;
        let right : number;

        for (i = 0; i < PROB.length; ++ i) {

            if (p < v)  
                break;
            
            if (i < PROB.length-1)
                v += PROB[i+1];
        }

        let type = EnemyType.MovingGroundEnemy; //  i as EnemyType;
        let w = (event.screenWidth/16) | 0;
        let startx = (Math.random() * w) | 0;

        let x = startx;
        do {

            if (platform.getTile(x) != 0 &&
                !platform.hasSpike(x)) {

                if (type == EnemyType.MovingGroundEnemy) {

                    [left, right] = this.computeEnemyMoveRange(platform, x, w);
                    if (Math.abs(left - right) == 2)
                        break;
                }

                nextObject<Enemy>(this.enemies, Enemy).spawn(
                    x*16 + 8,
                    platform.getPosition() - 8,
                    type,
                    (left+1)*16, right*16);
                break;
            } 

            x = (x + 1) % w;
        }
        while (x != startx);
    }


    private spawnObjects(platform : Platform, event : CoreEvent) : void {

        this.spawnCoins(platform, event);
        this.spawnEnemy(platform, event);
    }


    public update(moveSpeed : number, event : CoreEvent) : void {

        for (let c of this.coins) {

            c.update(moveSpeed, event);
        }

        for (let p of this.platforms) {

            p.update(moveSpeed, event);
        }

        for (let e of this.enemies) {

            e.update(moveSpeed, event);
        }

        this.player.update(moveSpeed, event);
    }


    public updatePhysics(moveSpeed : number, event : CoreEvent) : void {

        for (let c of this.coins) {

            c.updatePhysics(moveSpeed, event);
        }

        for (let e of this.enemies) {

            e.updatePhysics(moveSpeed, event);
        }

        this.player.updatePhysics(moveSpeed, event);

        for (let p of this.platforms) {

            p.objectCollision(this.player, moveSpeed, event);
            
            if (p.updatePhysics(moveSpeed, event)) {

                this.spawnObjects(p, event);
            }
        }   
    }


    public draw(canvas : Canvas) : void {

        let bmp = canvas.getBitmap("bmp1");

        for (let p of this.platforms) {

            p.draw(canvas, bmp);
        }

        for (let e of this.enemies) {

            e.draw(canvas, bmp);
        }

        for (let c of this.coins) {

            c.draw(canvas, bmp);
        }

        this.player.draw(canvas, bmp);
    }
}
