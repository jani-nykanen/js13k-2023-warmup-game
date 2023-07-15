import { Bitmap, createCustomBitmap, processFourColorBitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";
import { ActionMap, Input } from "./input.js";
import { Transition } from "./transition.js";
import { AudioPlayer } from "../audio/audioplayer.js";
import { Ramp, Sample } from "../audio/sample.js";
import { Program } from "./program.js";


export class CoreEvent {


    // Bitmaps are stored here since they are created here
    private bitmaps : Map<string, Bitmap>;
    // ...and also samples for some reason
    // TODO: Add a proper asset container class
    private samples : Map<string, Sample>;

    private loadCount : number = 0;
    private loaded : number = 0;

    private activeProgram : Program | undefined = undefined;
    private initialized : boolean = false;

    private readonly canvas : Canvas;

    public readonly input : Input;
    public readonly transition : Transition;
    public readonly audio : AudioPlayer;


    // TODO: Rename this to "tick" or something?
    public readonly step = 1.0;


    public get screenWidth() : number {

        return this.canvas.width;
    }


    public get screenHeight() : number {

        return this.canvas.height;
    }


    constructor(actions : ActionMap, canvas : Canvas) {

        this.input = new Input(actions);
        this.transition = new Transition();
        this.audio = new AudioPlayer(0.50);

        this.bitmaps = new Map<string, Bitmap> ();
        this.samples = new Map<string, Sample> ();

        canvas.setFetchBitmapCallback((name : string) => {

            return this.bitmaps.get(name);
        });
        this.canvas = canvas;
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
        monochrome = false, alphaThreshold = 128, colors : [number, number, number] = [255, 255, 255]) : void  {
    
        let bmp = createCustomBitmap(width, height, cb, monochrome, alphaThreshold, colors);
        this.bitmaps.set(name, bmp);
    }


    public createSample(name : string,
        sequence : number[][], baseVolume = 1.0,
        type : OscillatorType = "square",
        ramp : Ramp = Ramp.Exponential,
        fadeVolumeFactor : number = 0.5) : void {

        let sample = this.audio.createSample(sequence, baseVolume, type, ramp, fadeVolumeFactor);
        this.samples.set(name, sample);
    }


    public getSample = (name : string) : Sample | undefined => this.samples.get(name);

    
    public hasLoaded = () : boolean => this.loaded >= this.loadCount;


    public changeProgram(type : Function) : void {

        let param = this.activeProgram?.dispose();

        this.activeProgram = new type.prototype.constructor(param, this);
        this.initialized = false;
    }


    public initializeProgram() : void {

        if (this.initialized)
            return;

        this.activeProgram?.init(this);
        this.initialized = true;
    }


    public updateProgram = () : void => this.activeProgram?.update(this);
    public redrawProgram = (canvas : Canvas) : void => this.activeProgram?.redraw(canvas);
}
