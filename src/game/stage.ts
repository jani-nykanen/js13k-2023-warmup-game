import { CoreEvent } from "../core/event.js";
import { Canvas, Flip } from "../renderer/canvas.js";


const TILE_WIDTH = 8;
const TILE_HEIGHT = 8;


export class Stage {


    private bottomPlatform : Array<number>;
    private backgroundPlatforms : Array<number[]>;

    private width : number;

    private gridPointer : number = 0;
    private timer : number = 0.0;


    constructor(screenWidth : number) {

        const OFFSET = 2;

        this.width = OFFSET + ((screenWidth / TILE_WIDTH) | 0);
    
        this.bottomPlatform = (new Array<number> (this.width)).fill(0);
        this.backgroundPlatforms = new Array<number[]> (2);
        for (let i = 0; i < 2; ++ i) {

            this.backgroundPlatforms[i] = (new Array<number> (this.width)).fill(-1);
        }
    }


    public update(moveSpeed : number, event : CoreEvent) : void {

        this.timer = (this.timer + moveSpeed * event.delta) % 1.0;
    }


    public draw(canvas : Canvas) : void {

        const X_OFFSET = -TILE_WIDTH;

        let bmp = canvas.getBitmap("bmp1");

        let shift = Math.round(this.timer*TILE_WIDTH);

        let dx : number;
        let dy : number;

        // Forefront platform
        dy = canvas.height - 16;
        for (let i = 0; i < this.width; ++ i) {

            dx = X_OFFSET + i*TILE_WIDTH - shift;

            // Soil
            canvas.drawBitmap(bmp, dx, dy + TILE_HEIGHT, 16, 8, 8, 8);
            // Grass shadow
            canvas.drawBitmap(bmp, dx, dy, 16, 0, 8, 8);
            // Grass
            canvas.drawBitmap(bmp, dx, dy, 0, 0, 8, 8);
        }
    }
}
