function run(rng, oldPts, maxDelta){
    var pointCount = oldPts.length + (oldPts.length-1);
    var newPts = new Array(pointCount);


    // copy the old points
    for (var i = 0; i < pointCount; i+=2){
        newPts[i] = oldPts[i/2];
    }

    // calculate the new points
    for(var i = 1; i < pointCount; i+=2){
        // get the average of the points either side
        mid = (newPts[i-1] + newPts[i+1])/2;
        newPts[i] = mid + rng.genrand_real_scale(maxDelta);
    }
    return newPts;
}

MidPointDisplacement=function(){
    MidPointDisplacement.run = function(rng, oldPts, maxDelta){
        return run(rng, oldPts, maxDelta);
    }
}
