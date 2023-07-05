

export type Bitmap = HTMLImageElement | HTMLCanvasElement;


const stringTableToColorTable = (strTable : string[]) : number[][] => {

    let out = new Array<number[]> ();
    let len : number;

    for (let j = 0; j < strTable.length; ++ j) {

        len = (strTable[j].length/2) | 0;
        out.push(new Array<number> (len));
        for (let i = 0; i < len; ++ i) {

            out[i].push(parseInt(strTable[j].substring(i*2, i*2 + 2), 16));
        }
    }

    return out;
}   


const convertTile = (data : ImageData, 
    dx : number, dy : number, dw : number, dh : number, offset : number,
    palette : number[][]) : void => {

    let color : number[];
    let i : number;

    for (let y = dy; y < y + dh; ++ y) {

        for (let x = dx; x < dx + dw; ++ x) {

            i = y * offset + x;
            color = palette[(data[i*4] / 85) | 0];
            
            for (let j = 0; j < 4; ++ j) {

                data.data[i*4 + j] = color[j];
            }
        }
    }
}


export const processFourColorBitmap = (image : HTMLImageElement,
    gridWidth : number, gridHeight : number, paletteLookup : string[][]) : Bitmap => {

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    let data = ctx.getImageData(0, 0, image.width, image.height);

    let w = (canvas.width / gridWidth) | 0;
    let h = (canvas.height / gridHeight) | 0;

    // Faster than accessing image each tile?
    let imgWidth = image.width;
    // let imgHeight = image.height;

    let colorTable = paletteLookup.map(s => stringTableToColorTable(s));

    for (let y = 0; y < h; ++ y) {

        for (let x = 0; x < w; ++ x) {

            convertTile(data, 
                x*gridWidth, y*gridWidth, gridWidth, gridHeight, 
                imgWidth, colorTable[y*w + x]);
        }
    }

    return canvas as Bitmap;
} 
