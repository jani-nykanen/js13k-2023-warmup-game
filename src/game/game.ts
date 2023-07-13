import { CoreEvent } from "../core/event.js";
import { Program } from "../core/program.js";
import { Canvas, TextAlign } from "../renderer/canvas.js";
import { loadAndProcessBitmaps } from "./assets.js"
import { Stage } from "./stage.js";
import { GameState } from "./gamestate.js";


export class Game implements Program {


    private stage : Stage;
    private state : GameState;

    private moveSpeed : number = 0.0;
    private targetMoveSpeed : number = 0.5;
    private gameTimer : number = 0.0;

    private shakeTimer : number = 0.0;


    constructor(event : CoreEvent) {

        loadAndProcessBitmaps(event);

        // Need to initialize things here to avoid some warnings by Closure compiler...
        this.stage = new Stage(event);
        this.state = new GameState();
    }


    private computeMoveSpeed(event : CoreEvent) : void {

        const INITIAL_SPEED_UP_TIME = 60;
        const BASE_SPEED = 0.5;
        const MAX_SPEED = 2.0;
        const RAMP_TIME = 10*60;
        const RAMP_MAGNITUDE = 0.25;
        const MOVE_SPEED_DELTA = 0.01;

        if (this.stage.isPlayerDead()) {

            this.targetMoveSpeed = 0.0;
        }
        else if (this.gameTimer < INITIAL_SPEED_UP_TIME) {

            this.targetMoveSpeed = 0.5;
        }
        else {

            this.targetMoveSpeed = Math.min(MAX_SPEED,
                BASE_SPEED + Math.floor((this.gameTimer - INITIAL_SPEED_UP_TIME) / RAMP_TIME) * RAMP_MAGNITUDE
            );
        }

        if (this.targetMoveSpeed > this.moveSpeed) {

            this.moveSpeed = Math.min(this.targetMoveSpeed,
                this.moveSpeed + MOVE_SPEED_DELTA*event.step);
            return;
        }
        this.moveSpeed = Math.max(this.targetMoveSpeed,
            this.moveSpeed - MOVE_SPEED_DELTA*event.step);
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
        canvas.drawText(font, this.state.scoreToString(6), dx, 8, -1, 0, TextAlign.Center);

        dx += canvas.width/2;
        canvas.drawBitmap(bmp1, dx - 10, 1, 24, 80, 21, 8);
        canvas.drawText(font, this.state.bonusToString(), dx-4, 8, -2, 0, TextAlign.Center);
    }


    public init(event : CoreEvent) : void {

        // this.stage = new Stage(event);
    }


    public update(event : CoreEvent) : void {

        const DEATH_SHAKE_TIME = 30;

        this.gameTimer += event.step;
        this.computeMoveSpeed(event);

        if (this.shakeTimer > 0) {

            this.shakeTimer -= event.step;
        }

        let wasPlayerDead = this.stage.isPlayerDead();

        if (this.stage.update(this.gameTimer, this.moveSpeed, this.state, event)) {

            this.state.reset();
            this.stage.reset(event);
            this.gameTimer = 0;
            this.moveSpeed = 0.0;
            this.shakeTimer = 0;
            return;
        }

        if (!wasPlayerDead && this.stage.isPlayerDead()) {

            this.shakeTimer = DEATH_SHAKE_TIME;
        }
    }


    public redraw(canvas : Canvas) : void {

        const SHAKE_AMOUNT = 2;

        this.stage.drawBackground(canvas);

        if (this.shakeTimer > 0) {

            canvas.move(
                (Math.random() * 2 - 1) * SHAKE_AMOUNT,
                (Math.random() * 2 - 1) * SHAKE_AMOUNT);
        }
        this.stage.draw(canvas);

        canvas.moveTo();
        this.drawHUD(canvas);
    }

}
