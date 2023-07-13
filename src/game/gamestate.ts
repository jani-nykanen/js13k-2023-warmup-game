


export class GameState {


    private score : number = 0;
    private bonus : number = 0;


    
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


    public reset() : void {

        this.score = 0;
        this.bonus = 0;
    }
}
