


export class Vector {


    public x : number;
    public y : number;


    constructor(x = 0, y = 0) {

        this.x = x;
        this.y = y;
    }


    public clone = () : Vector => new Vector(this.x, this.y);
}
