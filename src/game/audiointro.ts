import { CoreEvent } from "../core/event.js";
import { Program, ProgramParam } from "../core/program.js";
import { TransitionType } from "../core/transition.js";
import { Canvas } from "../renderer/canvas.js";
import { drawTextBox } from "../ui/box.js";
import { Menu } from "../ui/menu.js";
import { MenuButton } from "../ui/menubutton.js";
import { Game } from "./game.js";


const TEXT = 
"WOULD YOU LIKE\n" +
"TO ENABLE AUDIO?\n" +
"PRESS ENTER TO\n" +
"CONFIRM.\n\n" +
"WARNING: YOU\n" +
"CANNOT CHANGE\n" +
"THIS LATER!";


export class AudioIntro implements Program {


    private menu : Menu;


    constructor(param : ProgramParam, event : CoreEvent) {

        this.menu = new Menu(
        [
            new MenuButton("YES", (event : CoreEvent) => this.goToGame(true, event)),
            new MenuButton("NO", (event : CoreEvent) => this.goToGame(false, event))

        ], true);
    }


    private goToGame(toggleAudio : boolean, event : CoreEvent) : void {

        event.audio.toggle(toggleAudio);
        event.transition.activate(false, TransitionType.Circle, 1.0/60.0, null);

        event.changeProgram(Game);
    }


    public init(event: CoreEvent) : void { }

    
    public update(event: CoreEvent) : void {

        this.menu.update(event);
    }


    public redraw(canvas: Canvas) : void {

        const SHADOW_OFFSET = 4;
        const COLORS = ["#ffffff", "#000000", "#5555aa"];

        canvas.clear("#0055aa");

        drawTextBox(canvas, canvas.getBitmap("font"),
            TEXT, canvas.width/2, 64, 12, 
            COLORS, SHADOW_OFFSET);
        this.menu.draw(canvas, 0, 48, 12, true, 
            COLORS, SHADOW_OFFSET);
    }


    public dispose(): ProgramParam {

        return undefined;
    }

}
