import { CoreEvent } from "../core/event.js";
import { Program } from "../core/program.js";
import { Canvas, TextAlign } from "../renderer/canvas.js";
import { loadAndProcessBitmaps } from "./assets.js"
import { Stage } from "./stage.js";
import { GameState } from "./gamestate.js";
import { InputState } from "../core/input.js";


export class Game implements Program {


    private stage : Stage;
    private state : GameState;

    private moveSpeed : number = 0.0;
    private targetMoveSpeed : number = 0.5;
    private gameTimer : number = 0.0;

    private shakeTimer : number = 0.0;
    
    private paused : boolean = false;
    private gameover : boolean = false;
    private gameoverTimer : number = 0;


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
        const RAMP_TIME = 30*60;
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


    private drawGameOver(canvas : Canvas) : void {

        const HEADER_OFFSET = -32;
        const SCORE_TEXT_OFFSET = 0;
        const APPEAR_TIME = 30;

        let bmpGameOver = canvas.getBitmap("gameover");
        let font = canvas.getBitmap("font");

        let dx =canvas.width/2 - bmpGameOver.width/2;
        let dy = canvas.height/2 - bmpGameOver.height/2 + HEADER_OFFSET

        let t : number;

        canvas.clear("rgba(0, 0, 0, 0.67)");

        if (this.gameoverTimer < APPEAR_TIME) {

            t = 1.0 - this.gameoverTimer / APPEAR_TIME;
            canvas.drawFunkyWaveEffectBitmap(bmpGameOver,
                dx, dy, t*t, 32, 2, 16);
            return;
        }

        canvas.drawBitmap(bmpGameOver, dx, dy);

        canvas.drawText(font,
            "SCORE: " + this.state.getScore(),
            canvas.width/2, 
            canvas.height/2 + SCORE_TEXT_OFFSET,
             0, 0, TextAlign.Center);

        canvas.drawText(font,
            "HISCORE: " + this.state.getHiscore(),
            canvas.width/2, canvas.height/2 + SCORE_TEXT_OFFSET + 16, 
            0, 0, TextAlign.Center);

    }


    private drawPause(canvas : Canvas) : void {

        let font = canvas.getBitmap("font");

        // If gameoverTimer is high enough:
        canvas.clear("rgba(0, 0, 0, 0.67)");

        canvas.drawText(font, "GAME PAUSED", 
            canvas.width/2, 
            canvas.height/2 - 4,
            0, 0, TextAlign.Center);

    }


    private reset(event : CoreEvent) : void {

        this.state.reset();
        this.stage.reset(event);
        this.gameTimer = 0;
        this.moveSpeed = 0.0;
        this.shakeTimer = 0;
        this.gameover = false;
    }


    public init(event : CoreEvent) : void {

        // this.stage = new Stage(event);
    }


    public update(event : CoreEvent) : void {

        const DEATH_SHAKE_TIME = 30;

        let startButtonPressed = event.input.getAction("start") == InputState.Pressed;

        if (startButtonPressed && !this.gameover) {

            this.paused = !this.paused;
        }
        if (this.paused) 
            return;

        this.gameTimer += event.step;
        this.computeMoveSpeed(event);
        
        this.stage.update(this.gameTimer, this.moveSpeed, this.state, event);

        if (this.shakeTimer > 0) {

            this.shakeTimer -= event.step;
        }

        if (this.gameover) {

            this.gameoverTimer += event.step;

            if (startButtonPressed) {

                this.reset(event);
                
            }
            return;
        }

        
        if (!this.gameover && this.stage.isPlayerDead()) {

            this.state.storeHiscore();

            this.gameover = true;
            this.gameTimer = 0;

            this.shakeTimer = DEATH_SHAKE_TIME;
            this.state.storeHiscore();
        }
    }


    public redraw(canvas : Canvas) : void {

        const SHAKE_AMOUNT = 4;

        this.stage.drawBackground(canvas);

        if (this.shakeTimer > 0) {

            canvas.move(
                (Math.random() * 2 - 1) * SHAKE_AMOUNT,
                (Math.random() * 2 - 1) * SHAKE_AMOUNT);
        }
        this.stage.draw(canvas);

        canvas.moveTo();
        if (this.stage.isPlayerDead()) {

            this.drawGameOver(canvas);
        }
        else {
            
            this.drawHUD(canvas);
        }

        if (this.paused) {

            this.drawPause(canvas);
        }
    }

}
