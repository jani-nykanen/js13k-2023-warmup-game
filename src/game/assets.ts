import { CoreEvent } from "../core/event.js";


const PALETTE_1 = [ 
    "000000ff", "00000000", "55aa00ff", "aaff00ff", // Grass
    "000000ff", "aa5555ff", "ffaa55ff", "00000000", // Soil
    "000000ff", "aaaaaaff", "ffffffff", "00000000", // Spike
];

const COLOR_TABLE_1 = [
    "0123", "0123", "4567", "4567", "4567", "89ab",
    "4567", "4567", "4567", "4567", "4567", "0000"
];


export const loadAndProcessBitmaps = (event : CoreEvent) : void => {

    const PATH = "bitmap1.png";

    event.loadFourColorBitmap("bmp1", PATH, 0, 1, COLOR_TABLE_1, PALETTE_1);
}
