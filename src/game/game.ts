import { CoreEvent } from "../core/event.js";
import { Program } from "../core/program.js";
import { Canvas, TextAlign } from "../renderer/canvas.js";
import { loadAndProcessBitmaps } from "./assets.js"
import { Stage } from "./stage.js";


export class Game implements Program {


    private stage : Stage;

    private moveSpeed : number = 0.0;
    private gameTimer : number = 0.0;


    constructor(event : CoreEvent) {

        loadAndProcessBitmaps(event);

        // Need to initialize things here to avoid some warnings by Closure compiler...
        this.stage = new Stage(event);
    }


    private computeMoveSpeed() : void {

        const INITIAL_SPEED_UP_TIME = 120;
        const BASE_SPEED = 0.5;
        const MAX_SPEED = 2.0;
        const RAMP_TIME = 30*60;
        const RAMP_MAGNITUDE = 0.25;

        if (this.gameTimer < INITIAL_SPEED_UP_TIME) {

            this.moveSpeed = this.gameTimer/(INITIAL_SPEED_UP_TIME) * BASE_SPEED;
            return;
        }

        this.moveSpeed = Math.min(MAX_SPEED,
            BASE_SPEED + Math.floor((this.gameTimer - INITIAL_SPEED_UP_TIME) / RAMP_TIME) * RAMP_MAGNITUDE
        );
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

        this.gameTimer += event.step;
        this.computeMoveSpeed();

        this.stage.update(this.gameTimer, this.moveSpeed, event);
    }


    public redraw(canvas : Canvas) : void {

        this.stage.drawBackground(canvas);
        this.stage.draw(canvas);

        this.drawHUD(canvas);
    }

}
