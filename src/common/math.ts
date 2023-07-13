

export const negMod = (m : number, n : number) : number => ((m % n) + n) % n;


export const weightedProbability = (weights : number[]) : number => {

    let p = Math.random();
    let v = weights[0];
    let i : number;

    for (i = 0; i < weights.length; ++ i) {

        if (p < v)  
            break;
        
        if (i < weights.length-1)
            v += weights[i+1];
    }

    return i;
}


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
