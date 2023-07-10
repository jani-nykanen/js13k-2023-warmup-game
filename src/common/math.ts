

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
