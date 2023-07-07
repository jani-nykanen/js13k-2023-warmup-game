import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { negMod } from "../common/math.js";


const TILE_WIDTH = 8;
const TILE_HEIGHT = 8;

const HOLE_TIME_MINIMUM = [20, 20, 20];
const HOLE_TIME_MAXIMUM = [40, 50, 50];

const HOLE_COUNT_MINIMUM = [2, 20, 20];
const HOLE_COUNT_MAXIMUM = [10, 50, 50];

const PLATFORM_MIN_HEIGHT = [2, 4, 8];
const PLATFORM_MAX_HEIGHT = [2, 8, 12];


export class Stage {


    private platforms : Array<number[]>;
    private holeTimers : Array<number>;
    private holeCounters : Array<number>;
    private platformHeights : Array<number>;

    private width : number;

    private gridPointer : number = 0;
    private timer : number = 0.0;


    constructor(screenWidth : number) {

        const OFFSET = 3;

        this.width = OFFSET + ((screenWidth / TILE_WIDTH) | 0);
    
        this.platforms = new Array<number[]> (3);
        this.holeTimers = new Array<number> (3);
        this.holeCounters = new Array<number> (3);
        this.platformHeights = new Array<number> (3);

        for (let i = 0; i < 3; ++ i) {

            this.platforms[i] = (new Array<number> (this.width)).fill(2);
            
            this.holeTimers[i] = HOLE_TIME_MINIMUM[i] + 
                Math.floor(Math.random() * (HOLE_TIME_MAXIMUM[i] - HOLE_TIME_MINIMUM[i] + 1));
            this.holeCounters[i] = 0;

            this.platformHeights[i] = i == 0 ? 2 : 0;
        }

        this.timer = 0.0;
    }

    private randomizeValue(min : number[], max : number[], i : number) : number {

        return min[i] + Math.floor(Math.random() * (max[i] - min[i]));
    }

    
    private updatePlatform(index : number) : void {

        if (this.holeCounters[index] > 0) {

            -- this.holeCounters[index];
            this.platforms[index][this.gridPointer] = 0;
        }
        else {

            this.platforms[index][this.gridPointer] = this.platformHeights[index];
        }

        -- this.holeTimers[index];
        if (this.holeTimers[index] < 0) {
            
            this.holeCounters[index] = this.randomizeValue(HOLE_COUNT_MINIMUM, HOLE_COUNT_MAXIMUM, index);
            this.holeTimers[index] = this.randomizeValue(HOLE_TIME_MINIMUM, HOLE_TIME_MAXIMUM, index);
            this.platformHeights[index] = this.randomizeValue(PLATFORM_MIN_HEIGHT, PLATFORM_MAX_HEIGHT, index);
        }
    }


    private drawPlatform(canvas : Canvas, bmp : Bitmap, index : number, shift : number) : void {

        const X_OFFSET = -TILE_WIDTH;
        const BRIDGE_Y_OFF = -5;

        let p = this.platforms[index];

        let dx : number;
        let dy : number;
        let sx : number;

        let left : number;
        let middle : number;
        let right : number;

        // Forefront platform
        dy = canvas.height - 16;
        for (let i = 0; i < this.width; ++ i) {

            left = p[negMod(i + this.gridPointer - 1, this.width)];
            middle = p[(i + this.gridPointer) % this.width];
            right = p[(i + this.gridPointer + 1) % this.width];

            dx = X_OFFSET + i*TILE_WIDTH - shift;

            // Bridge, but only in the front platform
            if (index == 0 && middle == 0) {

                dy = canvas.height - TILE_HEIGHT*2 + BRIDGE_Y_OFF;
                canvas.setFlag("flip", Flip.None);
                canvas.drawBitmap(bmp, dx, dy, 32, 0, 8, 16);

                continue;
            }

            dy = canvas.height - p[(i + this.gridPointer) % this.width]*TILE_HEIGHT;

            sx = (left == middle && right == middle) ? 0 : 8;
            canvas.setFlag("flip", right != middle ? Flip.Horizontal : Flip.None);

            // Soil
            for (let j = 1; j < middle; ++ j) {

                canvas.drawBitmap(bmp, dx, dy + j*TILE_HEIGHT, sx + 16, 8, 8, 8);
            }

            // Grass
            canvas.drawBitmap(bmp, dx, dy, sx + 16, 0, 8, 8);
            canvas.drawBitmap(bmp, dx, dy, sx, 0, 8, 8);
        }
    }


    public update(moveSpeed : number, event : CoreEvent) : void {

        this.timer += moveSpeed * event.delta;
        if (this.timer >= 1.0) {

            // TODO: Use "i in ..." instead?
            for (let i = 0; i < this.platforms.length; ++ i) {

                this.updatePlatform(i);
            }
            this.timer -= 1.0;
            this.gridPointer = (this.gridPointer + 1) % this.width;
        }
    }


    public draw(canvas : Canvas) : void {

        let bmp = canvas.getBitmap("bmp1");

        let shift = Math.floor(this.timer*TILE_WIDTH);

        for (let i = 2; i >= 0; -- i) {

            this.drawPlatform(canvas, bmp, i, shift);
        }
    }
}
