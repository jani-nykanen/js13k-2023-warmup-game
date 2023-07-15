import { CoreEvent } from "../core/event.js";
import { InputState } from "../core/input.js";
import { negMod } from "../common/math.js";
import { Canvas, TextAlign } from "../renderer/canvas.js";
import { MenuButton } from "./menubutton.js";
import { drawBox } from "./box.js";


export class Menu {


    private buttons : Array<MenuButton>;

    private cursorPos : number = 0;
    private active : boolean = false;
    
    private maxLength : number;


    constructor(buttons : Array<MenuButton>, makeActive = false) {

        this.buttons = buttons.map((_, i) => buttons[i].clone());
        this.maxLength = Math.max(...this.buttons.map(b => b.getText().length));

        this.active = makeActive;
    }


    public activate(cursorPos = this.cursorPos) : void {

        this.cursorPos = cursorPos % this.buttons.length;
        this.active = true;
    }


    public update(event : CoreEvent) : void {

        if (!this.active) return;

        let oldPos = this.cursorPos;
        if (event.input.getAction("up") == InputState.Pressed) {

            -- this.cursorPos;
        }
        else if (event.input.getAction("down") == InputState.Pressed) {

            ++ this.cursorPos;
        }

        if (oldPos != this.cursorPos) {

            this.cursorPos = negMod(this.cursorPos, this.buttons.length);
            event.audio.playSample(event.getSample("choose"), 0.60);
        }

        if (event.input.getAction("select") == InputState.Pressed ||
            event.input.getAction("start") == InputState.Pressed) {

                this.buttons[this.cursorPos].evaluateCallback(event);
            
            event.audio.playSample(event.getSample("select"), 0.60);
        }
    }


    public draw(canvas : Canvas, x = 0, y = 0, yoff = 12, box = true, 
        boxColors : string[] | undefined = undefined, boxShadowOffset = 0) : void {

        const BOX_OFFSET = 2;

        if (!this.active) return;

        let fonts = [canvas.getBitmap("font"), canvas.getBitmap("fontYellow")];

        let w = (this.maxLength +1 ) * 8;
        let h = this.buttons.length * yoff;

        let dx = x + canvas.width/2 - w/2;
        let dy = y + canvas.height/2 - h/2; 

        if (box) {

            if (boxColors == undefined) {

                boxColors = ["#ffffff", "#000000", "#0055aa"];
            }

            drawBox(canvas, 
                dx - BOX_OFFSET, 
                dy - BOX_OFFSET, 
                w + BOX_OFFSET*2, 
                h + BOX_OFFSET*2, 
                boxColors,
                boxShadowOffset);
        }

        for (let i = 0; i < this.buttons.length; ++ i) {

            canvas.drawText(
                fonts[Number(i == this.cursorPos)], 
                this.buttons[i].getText(),
                dx + 2, dy + 2 + i * yoff);
        } 
    }


    public isActive = () : boolean => this.active;


    public deactivate() : void {

        this.active = false;
    }


    public changeButtonText(index : number, text : string) : void {

        this.buttons[index].changeText(text);
    }
}
