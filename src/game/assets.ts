import { CoreEvent } from "../core/event.js";


const PALETTE_1 = [ "000000ff", "aa5555ff", "ffaa55ff", "00000000" ];
const COLOR_TABLE_1 = [
    "0123", "0123", "0123", "0123", "0123", "0123",
    "0123", "0123", "0123", "0123", "0123", "0123",
    "0123", "0123", "0123", "0123", "0123", "0123",
    "0123", "0123", "0123", "0123", "0123", "0123"
];


export const loadAndProcessBitmaps = (event : CoreEvent) : void => {

    const PATH = "test_image.png";

    event.loadFourColorBitmap("test", PATH, 0, 3, COLOR_TABLE_1, PALETTE_1);
}
