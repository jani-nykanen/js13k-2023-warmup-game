


export class GameState {


    private score : number = 0;
    private bonus : number = 0;
    private hiscore : number = 0;


    constructor() {

        let hiscore = 0;
        try {

            hiscore = Number(window.localStorage.getItem("js13kwarmup__hiscore"));
        }
        catch (e) {

            console.log("Could not access the local storage: " + String(e));
        }
        this.hiscore = hiscore;
    }

    
    public scoreToString(maxLength = 6) : string {

        let s = String(this.score);
        let zeros = "";
        for (let i = 0; i < maxLength - s.length; ++ i) {

            zeros += "0";
        }
        return zeros + s;
    }


    public bonusToString() : string {

        let dec = this.bonus % 10;
        let res = (this.bonus - dec) / 10;

        return "#" + String(1 + res) + "." + dec;
    }


    public addPoints(count : number) : void {

        this.score += (count * ((this.bonus + 10) / 10)) | 0;
    }


    public addBonus(count : number) : void {

        this.bonus += count;
    }


    public getScore = () : number => this.score;
    public getHiscore = () : number => this.hiscore;


    public reset() : void {

        this.score = 0;
        this.bonus = 0;
    }


    public storeHiscore() : void {

        if (this.score < this.hiscore) 
            return;

        this.hiscore = this.score;
        try {

            window.localStorage.setItem("js13kwarmup__hiscore", String(this.hiscore));
        }
        catch (e) {

            console.log("Could not access the local storage: " + String(e));
        }
    }
}
