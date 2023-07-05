

export const rgba = (r : number, g : number, b : number, a = 1.0) : string =>
    "rgba(" + String(r | 0) + "," + String(g | 0) + "," + String(b | 0) + "," + String(a) + ")";

export const rgb = (r : number, g : number, b : number) : string => rgba(r, g, b, 1.0);
