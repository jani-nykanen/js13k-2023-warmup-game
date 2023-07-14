import { Core } from "./core/core.js";
import { InputAction } from "./core/input.js";
import { Game } from "./game/game.js";


window.onload = () => {

    (new Core(144, 192,
        
        new Map<string, InputAction> (
        [   
            ["left", {keys: ["ArrowLeft"]}],
            ["right", {keys: ["ArrowRight"]}],
            ["up", {keys: ["ArrowUp"]}],
            ["down", {keys: ["ArrowDown"]}],

            ["jump", {keys: ["Space", "KeyZ", "ArrowUp"]}],
            ["start", {keys: ["Enter"]}],
        ])
    )).run(Game);
}
