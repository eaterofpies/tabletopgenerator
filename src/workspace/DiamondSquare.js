

function ds_allocate(oldPts){
    var size = (oldPts.length * 2) -1;

    var newPts = new Array(size);
    for(var i = 0; i < size; i++){
        newPts[i] = new Array(size);
    }
    return newPts;
}

function ds_copy(oldPts, newPts){
    var size = newPts.length;
    for(var x = 0; x < size; x +=2 ){
        for(var y = 0; y < size; y += 2){
            oldX = x/2;
            oldY = y/2;
            newPts[x][y] = oldPts[oldX][oldY];
        }
    }
}

function ds_diamond(newPts, rng, maxDelta){
    var size = newPts.length;
    for(var x = 1; x < size; x +=2 ){
        for(var y = 1; y < size; y += 2){
            newPts[x][y] = (newPts[x-1][y-1] + newPts[x+1][y-1] + newPts[x-1][y+1] + newPts[x+1][y+1])/4;
            newPts[x][y] += rng.realrange(-maxDelta, maxDelta);
        }
    }
}

function ds_square(newPts, rng, maxDelta){
    var size = newPts.length;
    for(var y = 0; y < size; y++){
        var x_start = 1;
        if (y % 2 == 1){
            x_start = 0;
        }
        for(var x = x_start; x < size; x +=2 ){
            var sum = 0;
            var count = 0;
            if (x - 1 >= 0){
                sum += newPts[x-1][y];
                count++;
            }

            if (x + 1 < size){
                sum += newPts[x+1][y];
                count++
            }

            if (y - 1 >= 0){
                sum += newPts[x][y-1];
                count++;
            }

            if (y + 1 < size){
                sum += newPts[x][y+1];
                count++
            }

            newPts[x][y] = (sum / count);
            newPts[x][y] += rng.realrange(-maxDelta, maxDelta);
        }
    }
}

function run(rng, oldPts, maxDelta){
    var newPts = ds_allocate(oldPts);

    ds_copy(oldPts, newPts);

    ds_diamond(newPts, rng, maxDelta);

    ds_square(newPts, rng, maxDelta);

    return newPts;
}


DiamondSquare=function(){
    DiamondSquare.run = function(rng, oldPts, maxDelta){
        return run(rng, oldPts, maxDelta);
    }
}
