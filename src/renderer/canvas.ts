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


export type Rotation = 0 | 1 | 2 | 3;


export class Canvas {


    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private flipFlag : Flip = Flip.None;
    private rotationFlag : Rotation = 0;

    private activeColor : string = "ffffffff";

    private fetchBitmapCallback : ((name : string) => Bitmap) | undefined = undefined;

    public readonly width : number;
    public readonly height : number;


    constructor(width : number, height : number) {

        this.width = width;
        this.height = height;

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
        c.fillStyle = this.activeColor;
    }


    public fillColor(colorStr : string) : void {

        this.ctx.fillStyle = (this.activeColor = colorStr);
    }


    public fillRect(x : number, y : number, w : number, h : number) : void {

        let c = this.ctx;

        c.fillRect(x | 0, y | 0, w | 0, h | 0);
    }


    public fillCircle(cx : number, cy : number, radius : number) : void {

        let c = this.ctx;

        let r : number;
        let ny : number;

        cx |= 0;
        cy |= 0;

        for (let y = -radius; y <= radius; ++ y) {

            ny = y/radius;

            r = Math.round(Math.sqrt(1 - ny*ny) * radius);
            if (r <= 0)
                continue;

            c.fillRect(cx - r, cy + y, r*2, 1);
        }
    }


    public fillRing(cx : number, cy : number, 
        innerRadius : number, outerRadius : number) : void {
        
        let c = this.ctx;

        let r1 : number;
        let r2 : number;
        let ny1 : number;
        let ny2 : number;

        if (innerRadius >= outerRadius)
            return;

        cx |= 0;
        cy |= 0;

        for (let y = -outerRadius; y <= outerRadius; ++ y) {

            ny1 = y/outerRadius;
            r1 = Math.round(Math.sqrt(1 - ny1*ny1) * outerRadius);
            if (r1 <= 0)
                continue;

            r2 = 0;
            if (Math.abs(y) < innerRadius) {

                ny2 = y/innerRadius;
                r2 = Math.round(Math.sqrt(1 - ny2*ny2) * innerRadius);
            }

            if (r2 <= 0) {

                c.fillRect(cx - r1, cy + y, r1*2, 1);
            }
            else {

                // Left-most part
                c.fillRect(cx - r1, cy + y, r1 - r2, 1);
                // Right-most part
                c.fillRect(cx + r2, cy + y, r1 - r2, 1);
            }
        }    
    }


    public drawBitmap(bmp : Bitmap | undefined, dx : number, dy : number, 
        sx = 0, sy = 0, sw = bmp.width, sh = bmp.height) : void {

        let c = this.ctx;
        let saveState = this.flipFlag != Flip.None || this.rotationFlag != 0;

        if (bmp == undefined)
            return;

        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;
        dx |= 0;
        dy |= 0;

        if (saveState) {

            c.save();
        }

        if (this.rotationFlag != 0) {

            c.translate(dx + sw/2, dy + sh/2);
            c.rotate(this.rotationFlag * Math.PI/2);

            dx = -sw/2;
            dy = -sh/2;
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

        c.drawImage(bmp, sx, sy, sw, sh, dx, dy, sw, sh);

        if (saveState) {

            c.restore();
        }
    }


    public drawText(font : Bitmap | undefined, str : string, 
        dx : number, dy : number, 
        xoff = 0.0, yoff = 0.0, align = TextAlign.Left) : void {

        if (font == undefined)
            return;

        let cw = (font.width / 16) | 0;
        let ch = cw;

        let x = dx;
        let y = dy;
        let chr : number;

        if (align == TextAlign.Center) {

            dx -= (str.length * (cw + xoff)) / 2.0 ;
            x = dx;
        }
        else if (align == TextAlign.Right) {
            
            dx -= (str.length * (cw + xoff));
            x = dx;
        }

        for (let i = 0; i < str.length; ++ i) {

            chr = str.charCodeAt(i);
            if (chr == '\n'.charCodeAt(0)) {

                x = dx;
                y += ch + yoff;
                continue;
            }
            chr -= 32;

            this.drawBitmap(font, x, y,
                (chr % 16) * cw, ((chr/16)|0) * ch, cw, ch);

            x += cw + xoff;
        }
    }


    public getBitmap = (name : string) : Bitmap | undefined => this.fetchBitmapCallback(name);


    public setFlag(flag : "flip" | "rotation", value : Flip | Rotation) : void {

        switch (flag) {

        case "flip":
            this.flipFlag = value as Flip;
            break;

        case "rotation":
            this.rotationFlag = value as Rotation;
            break;

        default:
            break;
        }
    }


    public resetFlags() : void {

        this.flipFlag = Flip.None;
        this.rotationFlag = 0;
    }


    public setAlpha(alpha = 1.0) : void {

        this.ctx.globalAlpha = alpha;
    }
    
}
