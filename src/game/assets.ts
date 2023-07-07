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

]

const COLOR_TABLE_1 = [
    "1078", "1078", "1560", "1560", "1560",
    "1560", "1560", "1340", "0000", "1560",
    "19A0", "19A0", "19A0", "19A0", "0000",
    "19A0", "19A0", "19A0", "19A0", "0000",
];


export const loadAndProcessBitmaps = (event : CoreEvent) : void => {

    const PATH = "bitmap1.png";

    event.loadFourColorBitmap("bmp1", PATH, 0, 3, COLOR_TABLE_1, PALETTE);
}
