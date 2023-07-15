import { CoreEvent } from "../core/event.js";


export class MenuButton {


    private text : string;
    private callback : (event : CoreEvent) => void;

    
    constructor(text : string, callback : (event : CoreEvent) => void) {

        this.text = text;
        this.callback = callback;
    }


    public getText = () : string => this.text;
    public evaluateCallback = (event : CoreEvent) : void => this.callback(event);


    public clone() : MenuButton {

        return new MenuButton(this.text, this.callback);
    }


    public changeText(newText : string) :void {

        this.text = newText;
    }
}
