


export class Vector {


    public x : number;
    public y : number;


    constructor(x = 0, y = 0) {

        this.x = x;
        this.y = y;
    }


    public zero() : void {

        this.x = 0;
        this.y = 0;
    }


    public clone = () : Vector => new Vector(this.x, this.y);
}
