import { CoreEvent } from "../core/event.js";
import { Canvas } from "../renderer/canvas.js";
import { Platform } from "./platform.js";
import { Coin } from "./coin.js";
import { nextObject } from "./gameobject.js";
import { Player } from "./player.js";
import { Enemy, EnemyType } from "./enemy.js";
import { weightedProbability, weightedProbabilityInterpolate } from "../common/math.js";
import { Particle } from "./particle.js";
import { Vector } from "../common/vector.js";
import { GameState } from "./gamestate.js";


const INITIAL_PLATFORM_INDEX = 2;


export const PLATFORM_OFFSET = 48;


export class Stage {


    private platforms : Platform[];
    private enemies : Enemy[];
    private coins : Coin[];
    private coinPositions : boolean[];
    private particles : Particle[];
    
    private player : Player;

    private cloudPos : number = 0.0;


    constructor(event : CoreEvent) {

        this.platforms = new Array<Platform> ();
        for (let y = 0; y < 6; ++ y) {

            this.platforms[y] = new Platform(y*PLATFORM_OFFSET, 
                (event.screenWidth/16) | 0, 
                y == INITIAL_PLATFORM_INDEX,
                y > INITIAL_PLATFORM_INDEX);
        }
        
        this.coins = new Array<Coin> ();
        this.coinPositions = (new Array<boolean> ()).fill(false);
        this.enemies = new Array<Enemy> ();
    
        this.particles = new Array<Particle> ();

        this.player = new Player(event.screenWidth/2, PLATFORM_OFFSET*2-8);
    }


    private spawnCoins(platform : Platform, event : CoreEvent) : void {

        const WEIGHTS = [0.25, 0.50, 0.20, 0.05];

        let count = weightedProbability(WEIGHTS);
        if (count == 0)
            return;

        let w = (event.screenWidth / 16) | 0;
        let x1 : number;
        let x2 : number;

        for (let i = 0; i < count; ++ i) {

            x2 = (Math.random() * w) | 0;
            x1 = x2;
            do {
                
                if (!this.coinPositions[x1] &&
                    !platform.hasSpike(x1)) {

                    nextObject<Coin>(this.coins, Coin).spawn(
                        x1*16 + 8, 
                        platform.getPosition() - PLATFORM_OFFSET/2 + 8);
        
                    this.coinPositions[x1] = true;
                    break;
                }

                x1 = (x1 + 1) % w;
            } while (x1 != x2); // This cannot really happen
        }
    }


    private computeEnemyMoveRange(platform : Platform, dx : number, w : number) : [number, number] {

        let left : number;
        let right :  number;
        
        for (left = dx; left >= 0; -- left) {

            if (platform.getTile(left) == 0 ||
                platform.hasSpike(left)) {

                break;
            }
        }

        for (right = dx; right <= w-1; ++ right) {

            if (platform.getTile(right) == 0 ||
                platform.hasSpike(right)) {

                break;
            }
        }
        return [left, right];
    }


    private spawnEnemy(time : number, platform : Platform, event : CoreEvent) : void {

        const MAX_INTERPOLATION_TIME = 120*60;

        const WEIGHTS_1 = [
            0.5, // Unknown
            0.30, // Ground, moving
            0.05, // Flying
            0.15,  // Ground, jumping
            0.0   // Bullet
        ]; 

        const WEIGHTS_2 = [
            0.20, // Unknown
            0.20, // Ground, moving
            0.20, // Flying
            0.20,  // Ground, jumping
            0.20   // Bullet
        ]; 

        let left : number;
        let right : number;

        let t = Math.min(1.0, time/MAX_INTERPOLATION_TIME);

        let i = weightedProbabilityInterpolate(WEIGHTS_1, WEIGHTS_2, t);
        if (i == 0)
            return;

        let type = i as EnemyType;
        let w = (event.screenWidth/16) | 0;
        let startx = (Math.random() * w) | 0;

        let x = startx;
        do {

            if (!this.coinPositions[x] &&
                ( type == EnemyType.FlyingEnemy || 
                ( platform.getTile(x) != 0 && !platform.hasSpike(x))) ) {

                if (type == EnemyType.MovingGroundEnemy) {

                    [left, right] = this.computeEnemyMoveRange(platform, x, w);
                    if (Math.abs(left - right) == 2) {

                        type = EnemyType.JumpingGroundEnemy;
                    }
                }
                else if (type == EnemyType.FlyingEnemy) {

                    left = -1;
                    right = w;
                }

                nextObject<Enemy>(this.enemies, Enemy).spawn(
                    x*16 + 8, platform,
                    type, event,
                    (left+1)*16, right*16);
                break;
            } 

            x = (x + 1) % w;
        }
        while (x != startx);
    }


    private spawnObjects(timer : number, platform : Platform, event : CoreEvent) : void {

        // TODO: 'Array.fill' would probably takes less space, but I don't want
        // to create new arrays if not necessary, even though this does 
        // not happen each frame
        for (let i = 0; i < this.coinPositions.length; ++ i) {

            this.coinPositions[i] = false;
        }

        this.spawnCoins(platform, event);
        this.spawnEnemy(timer, platform, event);
    }


    private spawnParticles(pos : Vector, count : number, color : string) : void {

        const BASE_SPEED_MIN = 1.0;
        const BASE_SPEED_MAX = 4.0;
        const SPEED_Y_BONUS = -3.0;

        let angleStep = Math.PI*2 / count;
        let angleStart = angleStep/2;
        let angle : number;
        let speed : number;

        for (let i = 0; i < count; ++ i) {

            speed = BASE_SPEED_MIN + 
                Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN);

            angle = angleStart + i*angleStep;
            nextObject<Particle>(this.particles, Particle)
                .spawn(pos.x, pos.y, 
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed + SPEED_Y_BONUS,
                    color);
        }
    }


    public update(gameTimer : number, moveSpeed : number, 
        state : GameState, event : CoreEvent) : boolean {

        const CLOUD_SPEED = 0.125;

        for (let p of this.particles) {

            p.update(moveSpeed, event);
        }

        for (let c of this.coins) {

            c.update(moveSpeed, event);
            if (c.playerCollision(this.player, event)) {

                state.addBonus(1);
            }
        }

        for (let e of this.enemies) {

            e.update(moveSpeed, event);
            if (e.playerCollision(this.player, moveSpeed, event)) {

                if (this.player.isDying()) {

                    this.spawnParticles(this.player.getPosition(), 12, "#ffffff");
                }
                else {

                    this.spawnParticles(e.getPosition(), 12, "#aa0000");
                    state.addBonus(1);
                }
            }
        }

        for (let p of this.platforms) {

            if (p.playerCollision(this.player, moveSpeed, event)) {

                if (this.player.isDying()) {

                    // TODO: A bit of repeating code here, add "spawnPlayerParticles" etc?
                    this.spawnParticles(this.player.getPosition(), 12, "#ffffff");
                }
                else {

                    state.addPoints(10);
                }
            }

            if (p.update(moveSpeed, event)) {

                this.spawnObjects(gameTimer, p, event);
            }
        }   
        this.player.update(moveSpeed, event);

        this.cloudPos = (this.cloudPos + CLOUD_SPEED*event.step) % event.screenWidth;

        return !this.player.doesExist();
    }


    public drawBackground(canvas : Canvas) : void {

        let bmpClouds = canvas.getBitmap("clouds");
        let bmp1 = canvas.getBitmap("bmp1");

        let y = canvas.height - 120;

        canvas.clear("#55aaff");

        // Moon
        canvas.fillColor("#aaffff");
        canvas.fillCircle(112, 64, 24);
        canvas.fillColor("#55aaff");
        canvas.fillCircle(112-12, 64-12, 24);

        // Clouds
        for (let i = 0; i < 2; ++ i) {
            
            canvas.drawBitmap(bmpClouds, -(this.cloudPos | 0) + i * bmpClouds.width, y);
        }

        // Horizon
        y += bmpClouds.height;
        for (let x = 0; x < canvas.width/8; ++ x) {

            canvas.drawBitmap(bmp1, x*8, y, 40, 0, 8, 8);
        }

        // Ocean
        y += 8;
        canvas.fillColor("#0055aa");
        canvas.fillRect(0, y, canvas.width, canvas.height-y);
    }


    public draw(canvas : Canvas) : void {

        let bmp1 = canvas.getBitmap("bmp1");

        for (let p of this.platforms) {

            p.draw(canvas, bmp1);
        }

        this.player.drawBottomLayer(canvas);

        for (let p of this.particles) {

            p.draw(canvas);
        }

        for (let e of this.enemies) {

            e.draw(canvas, bmp1);
        }

        for (let c of this.coins) {

            c.draw(canvas, bmp1);
        }

        this.player.draw(canvas, bmp1);
    }


    public reset(event : CoreEvent) : void {

        // Note: just recreating the whole "Stage" object
        // would be faster, but memory-wise would not be 
        // so good an idea

        for (let y = 0; y < 6; ++ y) {

            this.platforms[y] = new Platform(y*PLATFORM_OFFSET, 
                (event.screenWidth/16) | 0, 
                y == INITIAL_PLATFORM_INDEX,
                y > INITIAL_PLATFORM_INDEX);
        }

        for (let c of this.coins) {
            
            c.forceDead();
        }
        for (let e of this.enemies) {

            e.forceDead();
        }
        for (let p of this.particles) {

            p.forceDead();
        }
        this.player.respawn(event.screenWidth/2, PLATFORM_OFFSET*2-8);

        this.coinPositions.fill(false);
    }


    public isPlayerDead = () : boolean => this.player.isDying();
}
