import { Bitmap } from "../renderer/bitmap.js";
import { Canvas } from "../renderer/canvas.js";



export const drawBox = (canvas : Canvas, 
    x : number, y : number, w : number, h : number, 
    colors : string[]) : void => {

    let len = colors.length;

    for (let i = 0; i < len; ++ i) {

        canvas.fillColor(colors[i]);
        canvas.fillRect(x + i, y + i, w - i*2, h - i*2);
    }
}


export const drawTextBox = (canvas : Canvas, font : Bitmap,
    text : string, dx : number, dy : number, yoff : number, 
    colors : string[]) : void => {

    const BOX_OFFSET = 3;

    let lines = text.split("\n");
    let width = Math.max(...lines.map(l => l.length)) * 8;
    let height = lines.length * yoff;

    let x = dx - width/2;
    let y = dy - height/2;

    drawBox(canvas, 
        x - BOX_OFFSET, 
        y - BOX_OFFSET, 
        width + BOX_OFFSET*2, 
        height + BOX_OFFSET*2, colors);

    canvas.drawText(font, text, x+1, y+1, 0, yoff-8);
}
