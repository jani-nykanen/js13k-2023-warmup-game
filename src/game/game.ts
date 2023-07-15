import { CoreEvent } from "../core/event.js";
import { Program, ProgramParam } from "../core/program.js";
import { Canvas, TextAlign } from "../renderer/canvas.js";
import { Stage } from "./stage.js";
import { GameState } from "./gamestate.js";
import { InputState } from "../core/input.js";
import { TransitionType } from "../core/transition.js";


const GAMEOVER_TEXT_APPEAR_TIME = 30;


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

    private gameStarted : boolean = false;
    private gameStartTimer : number = 29; // TODO: Merge this and gameover timer


    constructor(programParam : ProgramParam, event : CoreEvent) {

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
        const CONTINUE_TEXT_OFFSET = 56;

        let bmpGameOver = canvas.getBitmap("gameover");
        let font = canvas.getBitmap("font");
        let fontYellow = canvas.getBitmap("fontYellow");

        let dx =canvas.width/2 - bmpGameOver.width/2;
        let dy = canvas.height/2 - bmpGameOver.height/2 + HEADER_OFFSET

        let t = 1.0;
        if (this.gameoverTimer < GAMEOVER_TEXT_APPEAR_TIME) {

            t = this.gameoverTimer / GAMEOVER_TEXT_APPEAR_TIME;
        }
        canvas.clear("rgba(0, 0, 0," + String(t * 0.67) + ")");

        if (this.gameoverTimer < GAMEOVER_TEXT_APPEAR_TIME) {
            
            canvas.drawFunkyWaveEffectBitmap(bmpGameOver,
                dx, dy, (1.0 - t)*(1.0 - t), 32, 2, 16);
            return;
        }
        else if ( ((((this.gameoverTimer % 60) | 0) / 30) | 0) == 1)  {

            canvas.drawText(fontYellow,
                "PRESS ENTER",
                canvas.width/2, 
                canvas.height/2 + CONTINUE_TEXT_OFFSET,
                 0, 0, TextAlign.Center);
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

        canvas.clear("rgba(0, 0, 0, 0.67)");

        canvas.drawText(font, "GAME PAUSED", 
            canvas.width/2, 
            canvas.height/2 - 4,
            0, 0, TextAlign.Center);
    }


    private drawGameStart(canvas : Canvas) : void {

        const WAVE_PERIOD = Math.PI*2;

        let font = canvas.getBitmap("font");
        let fontYellow = canvas.getBitmap("fontYellow");
        let bmpLogo = canvas.getBitmap("logo");

        let shift = (this.gameStartTimer / 60) * WAVE_PERIOD;

        canvas.clear("rgba(0, 0, 0, 0.67)");

        canvas.drawVerticallyWavingBitmap(bmpLogo, 0, 0, WAVE_PERIOD, 4, shift);
        canvas.drawText(font, "$2023 JANI NYK%NEN", canvas.width/2, canvas.height-9, 0, 0, TextAlign.Center);

        if (this.gameStartTimer >= 30) {

            canvas.drawText(fontYellow, "PRESS ENTER", 
                canvas.width/2, 
                canvas.height - 56,
                0, 0, TextAlign.Center);
        }
    }


    private reset(event : CoreEvent) : void {

        this.state.reset();
        this.stage.reset(event);

        this.gameTimer = 0;
        this.moveSpeed = 0.0;
        this.shakeTimer = 0;

        this.gameover = false;
        this.gameoverTimer = 0;
    }


    private updateGameStartScreen(event : CoreEvent) : void {

        this.gameStartTimer = (this.gameStartTimer + event.step) % 60;

        if (event.input.getAction("start") == InputState.Pressed) {

            event.audio.playSample(event.getSample("start"), 0.70);
            this.gameStarted = true;
        }
    }


    public init(event : CoreEvent) : void { }


    public update(event : CoreEvent) : void {

        // TODO: Split to shorter functions

        const DEATH_SHAKE_TIME = 30;

        if (event.transition.isActive())
            return;

        if (!this.gameStarted) {

            this.updateGameStartScreen(event);
            return;
        }

        let startButtonPressed = event.input.getAction("start") == InputState.Pressed;

        if (startButtonPressed && !this.gameover) {

            this.paused = !this.paused;
            event.audio.playSample(event.getSample("pause"), 0.70);
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
            if (startButtonPressed &&
                this.gameoverTimer >= GAMEOVER_TEXT_APPEAR_TIME) {

                event.audio.playSample(event.getSample("start"), 0.70);

                event.transition.activate(true, TransitionType.Fade, 1.0/30.0, 
                    (event : CoreEvent) => this.reset(event)
                );
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
        if (!this.gameStarted) {

            this.drawGameStart(canvas);
            return;
        }

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


    public dispose() : ProgramParam {

        return undefined;
    }
}
