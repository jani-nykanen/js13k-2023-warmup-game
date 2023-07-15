import { Core } from "./core/core.js";
import { CoreEvent } from "./core/event.js";
import { InputAction } from "./core/input.js";
import { loadAndProcessBitmaps } from "./game/assets.js";
import { AudioIntro } from "./game/audiointro.js";


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
            ["select", {keys: ["Enter", "Space"]}],
        ])
    )).run(AudioIntro,
        (event : CoreEvent) : void => {

            event.audio.toggle(false);
            event.audio.setGlobalVolume(0.60);
            loadAndProcessBitmaps(event);
        }
    );
}
