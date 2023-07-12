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
    "1560", "1560", "1340", "1D60", "1560", "0000",
    "19A0", "19A0", "19A0", "19A0", "14C0", "14C0",
    "19A0", "19A0", "19A0", "19A0", "1BC0", "1BC0",
    "14C0", "14C0", "1BC0", "1BC0", "1BC0", "1BC0",
    "1BC0", "1BC0", "1BC0", "1BC0", "1BC0", "1BC0",
    "1BC0", "1BC0", "14D0", "19D0", "14D0", "14D0",
    "1BC0", "14C0", "14D0", "14D0", "0400", "0400",
    "1D00", "1D00", "0000", "0000", "1870", "1E70",
    "1D00", "1D00", "0000", "0000", "1E70", "1E70",
];


const createCloudBitmap = (c : CanvasRenderingContext2D, width : number, height : number) : void => {

    const CLOUD_COUNT = 5;
    const CLOUD_HEIGHT = 12;

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


export const loadAndProcessBitmaps = (event : CoreEvent) : void => {

    const PATH = "bitmap1.png";

    event.loadFourColorBitmap("bmp1", PATH, 0, 9, COLOR_TABLE_1, PALETTE);
    event.createCustomBitmap("clouds", event.screenWidth, 96, createCloudBitmap);
}
