import { Core } from "./core/core.js";
import { InputAction } from "./core/input.js";
import { Game } from "./game/game.js";


window.onload = () => {

    (new Core(144, 192,
        
        new Map<string, InputAction> (
        [   
            ["left", {keys: ["ArrowLeft"], gamepadButtons: []}],
            ["right", {keys: ["ArrowRight"], gamepadButtons: []}],
            ["up", {keys: ["ArrowUp"], gamepadButtons: []}],
            ["down", {keys: ["ArrowDown"], gamepadButtons: []}],

            ["jump", {keys: ["Space", "KeyZ", "ArrowUp"], gamepadButtons: [0]}]
        ])
    )).run(Game);
}
