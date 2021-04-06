function gen_footprint(target){
    bounds = target.getBounds()

    // carve out the edges so that you can make corners out of them
    end_angle_rad = 45 * Math.PI/180;

    // connector inset
    c = 1200/9;

    // size of angled section
    ax = bounds[1].x - (1.5*c);
    ay = ax * Math.tan(end_angle_rad);

    pts = [
        // connector to the next barrier
        [-1.5 * c, bounds[1].y - c],
        [0.5 * c, bounds[1].y - c],
        [0.5 * c, bounds[1].y],
        [1.5 * c, bounds[1].y],
        [bounds[1].x, bounds[1].y - ay],
        [bounds[1].x, bounds[0].y + c + ay],
        [1.5 * c, bounds[0].y + c],
        [-0.5 * c, bounds[0].y + c],
        [-0.5 * c, bounds[0].y],
        [-1.5 * c, bounds[0].y],
        [bounds[0].x, bounds[0].y + ay],
        [bounds[0].x, bounds[1].y - c - ay]
    ];

    return polygon(pts);
}

function traffic_barrier(){
    // dimensions based on https://en.wikipedia.org/wiki/Jersey_barrier#/media/File:Jersey_barrier_2.png
    pts = [
        [-150, 1070],
        [150, 1070],
        [150 + 50, 255],
        [410, 0],
        [410, -75],
        [-410, -75],
        [-410, 0],
        [-150 - 50, 255]
    ];

    length = 2500;

    // length is approx 8ft
    var barrier = linear_extrude({height: length}, polygon(pts)).rotateX(90);

    // center it in x and y and zero it in z
    barrier = center([true, true, false], barrier).translate([0,0,75]);

    bounds = barrier.getBounds();
    width = bounds[1].x - bounds[0].x;
    height = bounds[1].z - bounds[0].z;

    footprint = linear_extrude({height: height}, gen_footprint(barrier));
    barrier = barrier.intersect(footprint);

    // make a cutout for forklift prongs
    forklift_prong = cube([width+10, 200, 75]).center([true, true, false]);

    // subtract out the forklift lifting holes 1.2M apart
    barrier = barrier.subtract([
        forklift_prong.translate([0,700,-0.1]),
        forklift_prong.translate([0,-700,-0.1]),
    ]);

    return barrier;
}

_tWallWidth = 180;
_tWallHeight = 300; //400;
_tWallDepth = 120;

function blast_barrier_section(){
    sectionDepth = _tWallDepth/3;
    return translate([0,0,0],
        union(
            cube([sectionDepth , _tWallWidth, _tWallHeight]),
            blast_barrier_low_section(),
            blast_barrier_low_section().rotateZ(180).translate([sectionDepth, _tWallWidth, 0])
        )
    );
}

function blast_barrier_low_section(){
    sectionDepth = _tWallDepth /3;
    width = _tWallWidth -(sectionDepth /3);
    return difference(
            cube([sectionDepth,width,_tWallDepth]),
            cube([80,80,_tWallHeight]).rotateZ(45).translate([0,-73,0]),
            cube([80,80,_tWallHeight]).rotateZ(45).translate([0,width-40,0]),
            cube([80,_tWallWidth,_tWallHeight]).translate([-80,0,0]).rotateY(40).translate([0,0,30])
        ).translate([-sectionDepth, 0, 0]);
}

function blast_barrier() {
    cutWidth = _tWallDepth/9;
    cutDepth = cutWidth *2;
    return difference(
        blast_barrier_section(),
        cube([cutDepth, cutWidth, _tWallHeight]).translate([cutWidth,0,0]),
        cube([cutDepth, cutWidth, _tWallHeight]).translate([0,_tWallWidth-cutWidth,0])
    );
}

Wall=function(){
    Wall.traffic_barrier = function(){
        return traffic_barrier();
    }

    Wall.blast_barrier = function(){
        return blast_barrier();
    }
}
