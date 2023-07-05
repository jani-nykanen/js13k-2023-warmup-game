import { Core } from "./core/core.js";
import { InputAction } from "./core/input.js";
import { Game } from "./game/game.js";


window.onload = () => {

    (new Core(256, 192, 1.0,
        
        new Map<string, InputAction> (
        [   
            ["left", {keys: ["KeyLeft"], gamepadButtons: []}],
            ["right", {keys: ["KeyRight"], gamepadButtons: []}],
            ["up", {keys: ["KeyUp"], gamepadButtons: []}],
            ["down", {keys: ["KeyDown"], gamepadButtons: []}],

            ["jump", {keys: ["KeyZ, Space"], gamepadButtons: [0]}]
        ])
    )).run(Game);
}
