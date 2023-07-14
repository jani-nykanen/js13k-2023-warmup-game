

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


const convertToRGB222 = (imageData : ImageData, len : number, alphaThreshold = 128) : void => {

    for (let i = 0; i < len; ++ i) {

        for (let j = 0; j < 3; ++ j) {

            imageData.data[i*4 + j] = Math.floor(imageData.data[i*4 + j] / 85) * 85;
        }
        imageData.data[i*4 + 3] = imageData.data[i*4 + 3] < alphaThreshold ? 0 : 255;
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

    let j = 0;
    for (let y = Math.max(0, startLine); y < Math.min(y + h, endLine + 1); ++ y) {

        for (let x = 0; x < w; ++ x) {

            if (j >= colorTables.length)
                continue;

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



export const createCustomBitmap = (width : number, height : number, 
    cb : (c : CanvasRenderingContext2D, width : number, height : number) => void,
    convert = false, alphaThreshold = 128) : Bitmap => {

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let imageData : ImageData;

    canvas.width = width;
    canvas.height = height;

    cb(ctx, width, height);

    if (convert) {

        ctx.drawImage(canvas, 0, 0);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        convertToRGB222(imageData, width*height, alphaThreshold);
        ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
}
