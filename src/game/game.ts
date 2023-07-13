import { CoreEvent } from "../core/event.js";
import { Program } from "../core/program.js";
import { Canvas, Flip, TextAlign } from "../renderer/canvas.js";
import { rgb, rgba } from "../renderer/color.js";
import { loadAndProcessBitmaps } from "./assets.js"
import { Stage } from "./stage.js";


const MOVE_SPEED = 1.0;


export class Game implements Program {


    private stage : Stage;


    constructor(event : CoreEvent) {

        loadAndProcessBitmaps(event);

        // Need to initialize things here to avoid some warnings by Closure compiler...
        this.stage = new Stage(event);
    }


    private drawHUD(canvas : Canvas) : void {

        const BOX_HEIGHT = 17;

        let font = canvas.getBitmap("font");
        let bmp1 = canvas.getBitmap("bmp1");

        let dx : number;

        canvas.fillColor("rgba(0, 0, 0, 0.33)");
        canvas.fillRect(0, 0, canvas.width, BOX_HEIGHT);
        
        dx = canvas.width/4;
        canvas.drawBitmap(bmp1, dx - 10, 1, 0, 80, 20, 8);
        canvas.drawText(font, "000000", dx, 8, -1, 0, TextAlign.Center);

        dx += canvas.width/2;
        canvas.drawBitmap(bmp1, dx - 10, 1, 24, 80, 21, 8);
        canvas.drawText(font, "#1.0", dx-4, 8, -2, 0, TextAlign.Center);
    }


    public init(event : CoreEvent) : void {

        // this.stage = new Stage(event);
    }


    public update(event : CoreEvent) : void {

        this.stage.update(MOVE_SPEED, event);
    }


    public updatePhysics(event : CoreEvent) : void {

        this.stage.updatePhysics(MOVE_SPEED, event);
    }


    public redraw(canvas : Canvas) : void {

        canvas.clear(rgb(85, 170, 255));

        this.stage.drawBackground(canvas);
        this.stage.draw(canvas);

        this.drawHUD(canvas);
    }

}
