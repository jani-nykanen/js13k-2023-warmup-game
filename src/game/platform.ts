import { CoreEvent } from "../core/event.js";
import { Bitmap } from "../renderer/bitmap.js";
import { Canvas, Flip } from "../renderer/canvas.js";
import { GameObject } from "./gameobject.js";
import { PLATFORM_OFFSET } from "./stage.js";
import { negMod } from "../common/math.js";
import { Player } from "./player.js";
import { Vector } from "../common/vector.js";

export class Platform {


    private tiles : number[];
    private spikes : boolean[];
    private posY : number;

    private scored : boolean = false;
    private recreated : boolean = false;
    
    public readonly width : number;


    constructor(startPos : number, width : number, initial = false, empty = false) {

        this.posY = startPos;
        this.width = width;

        this.tiles = new Array<number> (width);
        this.spikes = new Array<boolean> (width);

        if (empty) {

            this.tiles.fill(0);
        }
        else {

            this.computeTiles(initial);
        }

        this.scored = initial || empty;
    }


    private computeTiles(initial = false) : void {

        const BRIDGE_PROB = 0.5;
        const SPIKE_PROB = 0.25;

        let max = this.width/2;

        let counter = (Math.random() * max) | 0;
        let mode = initial ? 1 : (Math.random() * 2) | 0;

        let maxSpikeCount = 0;
        let basePlatformCount = 0;
        let startx = 0;

        // Base platform
        for (let i = 0; i < this.width; ++ i) {

            if (mode == 1) {

                ++ basePlatformCount;
            }

            this.tiles[i] = mode;
            this.spikes[i] = false;

            if ((-- counter) <= 0) {

                counter += (Math.random() * max + 1) | 0;
                if (mode == 1) {

                    mode = (initial || Math.random() < BRIDGE_PROB) ? 2 : 0;
                    if (!initial && i + counter >= this.width-1) {

                        mode = 0;
                    }
                    continue;
                }
                mode = 1;
            }
        }

        if (initial)
            return;

        // Spikes
        maxSpikeCount = (Math.random() * basePlatformCount/2) | 0;
        startx = (Math.random() * max) | 0;

        for (let i = startx; i < this.width; ++ i) {

            if (this.tiles[i] != 1)
                continue;

            if (Math.random() < SPIKE_PROB) {

                this.spikes[i] = true;
                if ((-- maxSpikeCount) <= 0) 
                    break;
            }
        }
    }


    public update(moveSpeed : number, event : CoreEvent) : boolean {

        const OFFSET = PLATFORM_OFFSET;

        this.recreated = false;

        this.posY += moveSpeed * event.step;
        if (this.posY > event.screenHeight + OFFSET) {

            this.posY -= event.screenHeight + OFFSET*2;
            this.computeTiles();

            this.recreated = true;
            this.scored = false;

            return true;
        }
        return false;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        const BRIDGE_OFFSET = -5;

        let p = Math.round(this.posY);

        let sx : number;
        let middle : number;
        let left : number;
        let right : number;

        for (let x = 0; x < this.width; ++ x) {

            canvas.setFlippingFlag(Flip.None);

            middle = this.tiles[x];
            // Gap
            if (middle == 0)
                continue;

            // Bridge
            if (middle == 2) {

                for (let i = 0; i < 2; ++ i) {

                    canvas.drawBitmap(bmp, x*16 + i*8, p + BRIDGE_OFFSET, 32, 0, 8, 16);
                }
                continue;
            }

            // Spikes
            if (this.spikes[x]) {

                for (let i = 0; i < 2; ++ i) {

                    canvas.drawBitmap(bmp, x*16 + i*8, p-8, 16, 8, 8, 8);
                }
            }

            left = x == 0 ? 1 : this.tiles[x-1];
            right = x == this.width-1 ? 1 : this.tiles[x+1];

            // Left column
            sx = left != middle ? 8 : 0;
            canvas.drawBitmap(bmp, x*16, p, sx, 0, 8, 8); // Grass
            canvas.drawBitmap(bmp, x*16, p, sx + 16, 0, 8, 8); // Grass shadow
            canvas.drawBitmap(bmp, x*16, p + 8, sx, 8, 8, 8); // Soil

            // Right column
            sx = right != middle ? 8 : 0;
            if (right != middle) {

                canvas.setFlippingFlag(Flip.Horizontal);
            }
            canvas.drawBitmap(bmp, x*16 + 8, p, sx, 0, 8, 8); // Grass
            canvas.drawBitmap(bmp, x*16 + 8, p, sx + 16, 0, 8, 8); // Grass shadow
            canvas.drawBitmap(bmp, x*16 + 8, p + 8, sx, 8, 8, 8); // Soil
        }
    }


    public playerCollision(o : Player, moveSpeed : number, event : CoreEvent) : boolean {

        const SPIKE_WIDTH = 8;
        const SPIKE_HEIGHT = 4;

        if (o.isDying() || !o.doesExist())
            return;

        let p : Vector;
        let hbox = new Vector(SPIKE_WIDTH, SPIKE_HEIGHT);
        let zero = new Vector();

        for (let x = 0; x < this.width; ++ x) {

            if (this.tiles[x] == 0)
                continue;

            if (this.spikes[x]) {

                p = new Vector(x*16 + 8, this.posY - SPIKE_HEIGHT/2);
                if (o.doesOverlayRect(p, zero, hbox)) {

                    o.kill(x*16 + 8, event);
                    return true;
                }
            }
            o.floorCollision(x*16, this.posY, 16, moveSpeed, event);
        }

        if (!this.scored && o.getPosition().y+8 < this.posY) {

            this.scored = true;
            return true;
        }
        return false;
    }


    public getPosition = () : number => this.posY;
    public getTile = (i : number) : number => this.tiles[negMod(i, this.width)];
    public hasSpike = (i : number) : boolean => this.spikes[negMod(i, this.width)];
    public wasRecreated = () : boolean => this.recreated;
}
