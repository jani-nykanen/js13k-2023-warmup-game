import { CoreEvent } from "../core/event.js";
import { Canvas } from "../renderer/canvas.js";
import { Platform } from "./platform.js";
import { Coin } from "./coin.js";
import { nextObject } from "./gameobject.js";


const PLATFORM_OFFSET = 64;


export class Stage {


    private platforms : Platform[];
    private coins : Coin[];


    constructor(event : CoreEvent) {

        this.platforms = new Array<Platform> ();
        for (let y = 0; y < 4; ++ y) {

            this.platforms[y] = new Platform(y*PLATFORM_OFFSET, (event.screenWidth/16) | 0);
        }
        
        this.coins = new Array<Coin> ();
    }


    private spawnCoins(y : number, event : CoreEvent) : void {

        let w = (event.screenWidth / 16) | 0;
        let x = (Math.random() * w) | 0;

        nextObject<Coin>(this.coins, Coin).spawn(x*16 + 8, y - PLATFORM_OFFSET/2 + 8);
    }


    public update(moveSpeed : number, event : CoreEvent) : void {

        for (let c of this.coins) {

            c.update(moveSpeed, event);
        }

        for (let p of this.platforms) {

            p.update(moveSpeed, event);
        }
    }


    public updatePhysics(moveSpeed : number, event : CoreEvent) : void {

        for (let c of this.coins) {

            c.updatePhysics(moveSpeed, event);
        }

        for (let p of this.platforms) {

            if (p.updatePhysics(moveSpeed, event)) {

                this.spawnCoins(p.getPosition(), event);
            }
        }
    }


    public draw(canvas : Canvas) : void {

        let bmp = canvas.getBitmap("bmp1");

        for (let p of this.platforms) {

            p.draw(canvas, bmp);
        }

        for (let c of this.coins) {

            c.draw(canvas, bmp);
        }
    }
}
