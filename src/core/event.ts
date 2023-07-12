import { Bitmap, createCustomBitmap, processFourColorBitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";
import { ActionMap, Input } from "./input.js";


export class CoreEvent {


    private frameStep : number;
    private frameDelta : number = 1.0;
    private frameInterpolation : number = 0.0;

    // Bitmaps are stored here since they are created here
    private bitmaps : Map<string, Bitmap>;
    private loadCount : number = 0;
    private loaded : number = 0;

    private readonly canvas : Canvas;

    public readonly input : Input;


    public get step() : number {

        return this.frameStep;
    }


    public get delta() : number {

        return this.frameDelta;
    }


    public get interpolationStep() : number {

        return this.frameInterpolation;
    }


    public get screenWidth() : number {

        return this.canvas.width;
    }


    public get screenHeight() : number {

        return this.canvas.height;
    }


    constructor(physicsStep : number, actions : ActionMap, canvas : Canvas) {

        this.input = new Input(actions);

        this.frameStep  = physicsStep;

        this.bitmaps = new Map<string, Bitmap> ();
        canvas.setFetchBitmapCallback((name : string) => {

            return this.bitmaps.get(name);
        });

        this.canvas = canvas;
    }


    public setDelta(time : number) : void {

        this.frameDelta = time;
    }


    public setInterpolationStep(value : number) : void {

        this.frameInterpolation = value;
    }


    public loadFourColorBitmap(name : string, path : string, 
        startLine : number, endLine : number,
        colorTable : string[], palette : string[]) : void {

        ++ this.loadCount;

        let img = new Image();
        img.onload = () => {

            ++ this.loaded;
            this.bitmaps.set(name, processFourColorBitmap(
                img, 8, 8, startLine, endLine, colorTable, palette));
        };
        img.src = path;
    }


    public createCustomBitmap(name : string,
        width : number, height : number, 
        cb : (c : CanvasRenderingContext2D, width : number, height : number) => void,
        convertToRGB222 = false) : void  {
    
        let bmp = createCustomBitmap(width, height, cb, convertToRGB222);
        this.bitmaps.set(name, bmp);
    }

    
    public hasLoaded = () : boolean => this.loaded >= this.loadCount;
}
