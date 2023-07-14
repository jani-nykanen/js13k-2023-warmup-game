import { Ramp } from "../audio/sample.js";
import { CoreEvent } from "../core/event.js";


const PALETTE = [

    "00000000", // 0 Alpha
    "000000ff", // 1 Black
    "555555ff", // 2 Dark gray
    "aaaaaaff", // 3 Light gray
    "ffffffff", // 4 White
    "aa5555ff", // 5 Soil 1
    "ffaa55ff", // 6 Soil 2
    "55aa00ff", // 7 Grass 1
    "aaff00ff", // 8 Grass 2
    "ffaa00ff", // 9 Coin 1
    "ffff55ff", // A Coin 2
    "5555aaff", // B Player 1
    "aaaaffff", // C Player 2
    "aa0000ff", // D Dark(ish) red
    "005500ff", // E Dark(ish) gren
    "0055aaff", // F Darker blue
    "55aaffff", // G Lighter blue,

]

const COLOR_TABLE_1 = [
    "1078", "1078", "1560", "1560", "1560", "0FG4",
    "1560", "1560", "1340", "1D60", "1560", "1D90",
    "19A0", "19A0", "19A0", "19A0", "14C0", "14C0",
    "19A0", "19A0", "19A0", "19A0", "1BC0", "1BC0",
    "14C0", "14C0", "1BC0", "1BC0", "1BC0", "1BC0",
    "1BC0", "1BC0", "1BC0", "1BC0", "1BC0", "1BC0",
    "1BC0", "1BC0", "14D0", "19D0", "14D0", "14D0",
    "1BC0", "14C0", "14D0", "14D0", "0400", "0400",
    "1D00", "1D00", "1430", "1230", "1870", "1E70",
    "1D00", "1D00", "1230", "1230", "1E70", "1E70",
    "000A", "000A", "000A", "000A", "000A", "000A",
];


const createCloudBitmap = (c : CanvasRenderingContext2D, width : number, height : number) : void => {

    const CLOUD_COUNT = 6;
    const CLOUD_HEIGHT = 10;

    let cloudWidth = width / CLOUD_COUNT;
    let step = width / cloudWidth;

    let f = (t : number) : number => (1.0 - Math.abs(Math.sin(t * step * Math.PI)) + Math.sin(t * Math.PI*2)) * CLOUD_HEIGHT;

    c.clearRect(0, 0, width, height);

    let y : number;

    c.fillStyle = "#ffffff";
    for (let x = 0; x < width; ++ x) {

        y =  height/2 + Math.ceil(f(x / width));
        c.fillRect(x, y, 1, height-y);
    }
}


const createYouDieText = (c : CanvasRenderingContext2D, width : number, height : number) : void => {

    const STR = "Game Over!";

    c.font = "bold 18px Arial";
    c.textAlign = "center";

    c.fillStyle = "#ffffff";
    c.fillText(STR, width/2, height-2);
}


const createSamples = (event : CoreEvent) : void => {

    event.createSample("die",
        [[192, 4], [144, 8], [96, 16]],
        0.70, "square", Ramp.Exponential, 0.20
    );
    event.createSample("jump",
        [[96, 8], [112, 7], [160, 6], [256, 4]],
        0.70, "sawtooth", Ramp.Exponential, 0.20
    );
    event.createSample("coin",
        [[256, 3], [400, 4], [480, 5], [512, 10]],
        0.70, "square", Ramp.Instant, 0.20
    );
    event.createSample("kill",
        [[320, 4], [192, 6], [96, 10]],
        0.70, "square", Ramp.Linear, 0.20
    );
}


export const loadAndProcessBitmaps = (event : CoreEvent) : void => {

    const BMP_PATH = "bitmap1.png";
    const FONT_PATH = "font.png";

    event.loadFourColorBitmap("bmp1", BMP_PATH, 0, 10, COLOR_TABLE_1, PALETTE);
    event.loadFourColorBitmap("font", FONT_PATH, 0, 3, 
        (new Array<string>(16*4)).fill("0004"),
        PALETTE);
    // TODO: Might be a good idea not to have the same bitmap loaded twice, but
    // pass an array of names, palettes etc. to the function to create multiple
    // bitmaps from one loaded bitmap
    event.loadFourColorBitmap("fontYellow", FONT_PATH, 0, 3, 
        (new Array<string>(16*4)).fill("000A"),
        PALETTE);

    event.createCustomBitmap("clouds", event.screenWidth, 80, createCloudBitmap);
    event.createCustomBitmap("gameover", 112, 20, createYouDieText, true, 192, [255, 0, 0]);

    createSamples(event);
}
