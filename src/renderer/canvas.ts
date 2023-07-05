

const createCanvasElement = (width : number, height : number) : [HTMLCanvasElement, CanvasRenderingContext2D] => {

    const styleArg = "position: absolute; top: 0; left: 0; z-index: -1;"

    let div : HTMLElement;
    let canvas : HTMLCanvasElement;

    canvas = document.createElement("canvas");
    canvas.setAttribute("style", styleArg);
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


    public get width() : number {

        return this.canvas.width;
    }
    public get height() : number {

        return this.canvas.height;
    }


    constructor(width : number, height : number) {

        [this.canvas, this.ctx] = createCanvasElement(width, height);

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


    public clear(colorStr : string) : void {

        let c = this.ctx;

        c.fillStyle = colorStr;
        c.fillRect(0, 0, this.width, this.height);
    }
}
