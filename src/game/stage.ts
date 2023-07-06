import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";


const TILE_WIDTH = 8;
const TILE_HEIGHT = 8;

const HOLE_TIME_MINIMUM = [2, 20, 20];
const HOLE_TIME_MAXIMUM = [10, 50, 50];

const HOLE_COUNT_MINIMUM = [2, 20, 20];
const HOLE_COUNT_MAXIMUM = [10, 50, 50];


export class Stage {


    private platforms : Array<number[]>;
    private holeTimers : Array<number>;
    private holeCounters : Array<number>;

    private width : number;

    private gridPointer : number = 0;
    private timer : number = 0.0;


    constructor(screenWidth : number) {

        const OFFSET = 2;

        this.width = OFFSET + ((screenWidth / TILE_WIDTH) | 0);
    
        this.platforms = new Array<number[]> (3);
        this.holeTimers = new Array<number> (3);
        this.holeCounters = new Array<number> (3);

        for (let i = 0; i < 3; ++ i) {

            this.platforms[i] = (new Array<number> (this.width)).fill(2);
            
            this.holeTimers[i] = HOLE_TIME_MINIMUM[i] + 
                Math.floor(Math.random() * (HOLE_TIME_MAXIMUM[i] - HOLE_TIME_MINIMUM[i]));
            this.holeCounters[i] = 0;
        }

        this.timer = 0.0;
    }

    
    private updatePlatform(index : number) : void {

        if (this.holeCounters[index] > 0) {

            -- this.holeCounters[index];

            this.platforms[index][this.gridPointer] = 0;
        }
        else {

            this.platforms[index][this.gridPointer] = 2;
        }

        -- this.holeTimers[index];
        if (this.holeTimers[index] < 0) {
            
            this.holeCounters[index] = HOLE_COUNT_MINIMUM[index] + 
                Math.floor(Math.random() * (HOLE_COUNT_MAXIMUM[index] - HOLE_COUNT_MINIMUM[index]));

            this.holeTimers[index] = this.holeCounters[index] +
                HOLE_TIME_MINIMUM[index] + 
                Math.floor(Math.random() * (HOLE_TIME_MAXIMUM[index] - HOLE_TIME_MINIMUM[index]));
        }
    }


    private drawPlatform(canvas : Canvas, bmp : Bitmap, index : number, shift : number) : void {

        const X_OFFSET = -TILE_WIDTH;

        let p = this.platforms[index];

        let dx : number;
        let dy : number;

        // Forefront platform
        dy = canvas.height - 16;
        for (let i = 0; i < this.width; ++ i) {

            dx = X_OFFSET + i*TILE_WIDTH - shift;
            dy = canvas.height - p[(i + this.gridPointer) % this.width] * TILE_HEIGHT;

            // Soil
            canvas.drawBitmap(bmp, dx, dy + TILE_HEIGHT, 16, 8, 8, 8);
            // Grass shadow
            canvas.drawBitmap(bmp, dx, dy, 16, 0, 8, 8);
            // Grass
            canvas.drawBitmap(bmp, dx, dy, 0, 0, 8, 8);
        }
    }


    public update(moveSpeed : number, event : CoreEvent) : void {

        this.timer += moveSpeed * event.delta;
        if (this.timer >= 1.0) {

            // TODO: Use i in ... instead?
            for (let i = 0; i < this.platforms.length; ++ i) {

                this.updatePlatform(i);
            }
            this.timer -= 1.0;
            this.gridPointer = (this.gridPointer + 1) % this.width;
        }
    }


    public draw(canvas : Canvas) : void {

        let bmp = canvas.getBitmap("bmp1");

        let shift = Math.round(this.timer*TILE_WIDTH);

        this.drawPlatform(canvas, bmp, 0, shift);
    }
}
