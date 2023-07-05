

export type Bitmap = HTMLImageElement | HTMLCanvasElement;


const unpackPalette = (palette : string[]) : number[][] => {

    let out = new Array<number[]> ();
    let len : number;

    for (let j = 0; j < palette.length; ++ j) {

        len = (palette[j].length/2) | 0;
        out.push(new Array<number> (len));
        for (let i = 0; i < len; ++ i) {

            out[j][i] = parseInt(palette[j].substring(i*2, i*2 + 2), 16);
        }
    }
    return out;
}   


const convertTile = (imageData : ImageData, 
    dx : number, dy : number, dw : number, dh : number, offset : number,
    colorTable : number[], palette : number[][]) : void => {

    let paletteEntry : number[];
    let i : number;

    for (let y = dy; y < dy + dh; ++ y) {

        for (let x = dx; x < dx + dw; ++ x) {

            i = y * offset + x;
            paletteEntry = palette[colorTable[(imageData.data[i*4] / 85) | 0]];

            for (let j = 0; j < 4; ++ j) {

                imageData.data[i*4 + j] = paletteEntry[j];
            }
        }
    }
}


export const processFourColorBitmap = (image : HTMLImageElement,
    gridWidth : number, gridHeight : number, 
    startLine : number, endLine : number,
    colorTables: string[], packedPalette : string[]) : Bitmap => {

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    let imageData = ctx.getImageData(0, 0, image.width, image.height);

    let w = (canvas.width / gridWidth) | 0;
    let h = (canvas.height / gridHeight) | 0;

    // Faster than accessing image each tile?
    let imgWidth = image.width;
    // let imgHeight = image.height;

    let colorTable : number[];
    let palette = unpackPalette(packedPalette);

    console.log(palette);

    let j = 0;
    for (let y = Math.max(0, startLine); y < Math.min(y + h, endLine + 1); ++ y) {

        for (let x = 0; x < w; ++ x) {
            
            colorTable = colorTables[j].split("").map((s : string) => parseInt(s, 32));
            convertTile(imageData, 
                x*gridWidth, y*gridWidth, gridWidth, gridHeight, 
                imgWidth, colorTable, palette);

            ++ j;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas as Bitmap;
} 
