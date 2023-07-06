import { Bitmap } from "./bitmap.js";


const createCanvasElement = (width : number, height : number) : [HTMLCanvasElement, CanvasRenderingContext2D] => {

    const styleArg = "position: absolute; top: 0; left: 0; z-index: -1;"

    let div : HTMLElement;
    let canvas : HTMLCanvasElement;

    canvas = document.createElement("canvas");
    canvas.setAttribute("style", styleArg);
    canvas.setAttribute(
        "style", 
        "position: absolute; top: 0; left: 0; z-index: -1;" + 
        "image-rendering: optimizeSpeed;" + 
        "image-rendering: pixelated;" +
        "image-rendering: -moz-crisp-edges;");

    canvas.width = width;
    canvas.height = height;

    div = document.createElement("div");
    div.setAttribute("style", styleArg);
    div.appendChild(canvas);

    document.body.appendChild(div);

    return [
        canvas, 
        canvas.getContext("2d") as CanvasRenderingContext2D
    ];
}


export const enum Flip {

    None = 0,
    Horizontal = 1,
    Vertical = 2,
    Both = 3
};


export const enum TextAlign {

    Left = 0,
    Center = 1,
    Right = 2
};


export class Canvas {


    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private flipFlag : Flip = Flip.None;

    private fetchBitmapCallback : ((name : string) => Bitmap) | undefined = undefined;


    public get width() : number {

        return this.canvas.width;
    }
    public get height() : number {

        return this.canvas.height;
    }


    constructor(width : number, height : number) {

        [this.canvas, this.ctx] = createCanvasElement(width, height);
        this.ctx.imageSmoothingEnabled = false;

        window.addEventListener("resize", () => {

            this.resize(window.innerWidth, window.innerHeight);
        });
        this.resize(window.innerWidth, window.innerHeight);
    }


    private resize(width : number, height : number) : void {

        let m = Math.min(width / this.width, height / this.height);
        if (m > 1.0)
            m |= 0;

        this.canvas.style.width  = String((m*this.width) | 0) + "px";
        this.canvas.style.height = String((m*this.height) | 0) + "px";
    
        this.canvas.style.left = String((width/2 - m*this.width/2) | 0) + "px";
        this.canvas.style.top  = String((height/2 - m*this.height/2) | 0) + "px";
    }


    public setFetchBitmapCallback(fetchBitmapCallback? : ((name : string) => Bitmap)) {

        this.fetchBitmapCallback = fetchBitmapCallback;
    }


    public clear(colorStr : string) : void {

        let c = this.ctx;

        c.fillStyle = colorStr;
        c.fillRect(0, 0, this.width, this.height);
    }


    public drawBitmap(bmp : Bitmap | undefined, dx : number, dy : number, 
        sx = 0, sy = 0, sw = bmp.width, sh = bmp.height) : void {

        let c = this.ctx;

        if (bmp == undefined)
            return;

        sw |= 0;
        sh |= 0;

        if (this.flipFlag != Flip.None) {
            c.save();
        }

        if ((this.flipFlag & Flip.Horizontal) != 0) {

            c.translate(sw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        if ((this.flipFlag & Flip.Vertical) != 0) {

            c.translate(0, sh);
            c.scale(1, -1);
            dy *= -1;
        }

        c.drawImage(bmp, sx | 0, sy | 0, sw, sh, dx | 0, dy | 0, sw, sh);

        if (this.flipFlag != Flip.None) {

            c.restore();
        }
    }


    public getBitmap = (name : string) : Bitmap | undefined => this.fetchBitmapCallback(name);


    public setFlag(flag : "flip", value : Flip) : void {

        switch (flag) {

        case "flip":
            this.flipFlag = value as Flip;
            break;

        default:
            break;
        }
    }
}
