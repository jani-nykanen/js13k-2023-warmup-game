

export type InputAction = { keys : string[] };
export type ActionMap = Map<string, InputAction>;


export const enum InputState {

    Up = 0,
    Down = 1,
    Released = 2,
    Pressed = 3,

    DownOrPressed = 1,
}


export class Input {


    private keys : Map<string, InputState>;
    private prevent : Array<string>;
    private actions : ActionMap;

    private anyKeyPressed : boolean = false;


    public get anythingPressed() : boolean {

        return this.anyKeyPressed; // || this.anyGamepadButtonPressed;
    }


    constructor(actions : ActionMap) {

        this.keys = new Map<string, InputState> ();
        this.prevent = new Array<string> ();
        this.actions = actions;

        for (let k of actions.keys()) {

            for (let j of actions.get(k).keys) {

                this.prevent.push(j);
                this.keys.set(j, InputState.Up);
            }
        }
        
        window.addEventListener("keydown", (e : KeyboardEvent) => {

            if (this.prevent.includes(e.code)) {

                e.preventDefault();
            }
            this.keyEvent(e.code, InputState.Pressed);
        });

        window.addEventListener("keyup", (e : KeyboardEvent) => {

            if (this.prevent.includes(e.code)) {

                e.preventDefault();
            }
            this.keyEvent(e.code, InputState.Released);
        });

        window.addEventListener("contextmenu", (e : MouseEvent) => e.preventDefault());
        // The bottom two are mostly needed if this game is ever being
        // run inside an iframe
        window.addEventListener("mousemove", () => window.focus());
        window.addEventListener("mousedown", () => window.focus());
    }


    private keyEvent(key : string, state : InputState) : void {

        if (this.keys.get(key) === state-2)
            return;

        this.keys.set(key, state);
        this.anyKeyPressed ||= Boolean(state & 1);
    }


    public update() : void {

        let v : InputState | undefined;

        for (let k of this.keys.keys()) {

            if ((v = this.keys.get(k) as InputState) > 1) {
                
                this.keys.set(k, v-2);
            }
        }

        this.anyKeyPressed = false;
    }


    public getAction(name : string) : InputState {

        let state = InputState.Up;
        let a = this.actions.get(name);
        
        if (a == undefined)
            return InputState.Up;

        for (let k of a.keys) {

            if ((state = (this.keys.get(k) as InputState) ) != InputState.Up)
                break;
        }
        return state;
    }
}
