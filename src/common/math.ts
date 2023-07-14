

export const negMod = (m : number, n : number) : number => ((m % n) + n) % n;


export const clamp = (x : number, min : number, max : number) : number => Math.max(Math.min(x, max), min);


export const weightedProbability = (weights : number[]) : number => weightedProbabilityInterpolate(weights, weights, 1.0);


export const weightedProbabilityInterpolate = (weights1 : number[], weights2 : number[], t : number) : number => {

    let p = Math.random();
    let v1 = weights1[0];
    let v2 = weights2[0];
    let i : number;

    let len = Math.min(weights1.length, weights2.length);

    let v = (1.0 - t)*v1 + t*v2;

    for (i = 0; i < len; ++ i) {

        if (p < v)  
            break;
        
        if (i < len-1) {

            v1 = weights1[i+1];
            v2 = weights2[i+1];

            v +=(1.0 - t)*v1 + t*v2;
        }
    }

    return i;
}
