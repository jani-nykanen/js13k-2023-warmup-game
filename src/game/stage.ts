import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { negMod } from "../common/math.js";
import { Platform } from "./platform.js";


export class Stage {


    private platforms : Platform[];


    constructor(event : CoreEvent) {

        const PLATFORM_OFFSET = 64;

        this.platforms = new Array<Platform> ();
        for (let y = 0; y < 4; ++ y) {

            this.platforms[y] = new Platform(y*PLATFORM_OFFSET, (event.screenWidth/16) | 0);
        }
    }


    public update(moveSpeed : number, event : CoreEvent) : void {

        for (let p of this.platforms) {

            p.update(moveSpeed, event);
        }
    }


    public updatePhysics(moveSpeed : number, event : CoreEvent) : void {

        for (let p of this.platforms) {

            p.updatePhysics(moveSpeed, event);
        }
    }


    public draw(canvas : Canvas) : void {

        let bmp = canvas.getBitmap("bmp1");

        for (let p of this.platforms) {

            p.draw(canvas, bmp);
        }
    }
}
