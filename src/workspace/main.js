include("DiamondSquare.js");
include("HeightMap.js");
include("MersenneTwister.js");
include("MidPointDisplacement.js");
include("Wall.js");
include("Util.js");

"use strict";

function make_surface(seed, maxDelta, iterations){
    var rng = RngFactory.create(seed);
    return DiamondSquare.make_surface(rng, maxDelta, iterations);
}

function make_mpd(rng, maxDelta, iterations, wrap){

    var pts = [
        rng.realrange(0, maxDelta*2)
    ];


    // Always get the random number
    // the rest of the shape is similar
    var farPt = rng.realrange(0, maxDelta*2);

    if (wrap === true){
        pts.push(pts[0]);
    } else {
        pts.push(farPt);
    }

    for (var i = 0; i < iterations; i++){
        maxDelta /= 1.5;
        pts = MidPointDisplacement.run(rng, pts, maxDelta);
    }

    return pts;
}

function make_bullet_hole(seed, iterations, maxDelta, maxDiameter, maxDepth){
    var rng = RngFactory.create(seed);

    depth = maxDepth * rng.real();

    offsets = make_mpd(rng, maxDelta, iterations, true);

    var points  = HeightMap.to_points_circular(offsets, maxDiameter/2);
    return Util.closed_triangle_fan_pair(points, depth).rotateY(90);
}

function get_size(obj){
    obj_bounds = obj.getBounds();
    x = obj_bounds[1].x - obj_bounds[0].x;
    y = obj_bounds[1].y - obj_bounds[0].y;
    z = obj_bounds[1].z - obj_bounds[0].z;
    return [x, y, z];
}

function position_bullet_hole(target, seed, hole){
    target_bounds = target.getBounds();
    target_size = get_size(target);

    // position in the range of the sides of the wall
    var rng = RngFactory.create(seed);

    // pick a side to do the damage on
    side = rng.real() < 0.5;

    // flip the bullet hole before working out the shape of the path incase it's off center
    if (side){
        hole = hole.rotateY(180);
    }

    hole_size = get_size(hole);
    hole_bounds = hole.getBounds();

    // work out the approximate shape of the path of the shot
    projectile_path = cube({size: [target_size[0], hole_size[1], hole_size[2]], center:[true, false, false]})

    projectile_path = projectile_path.translate([0,hole_bounds[0].y, hole_bounds[0].z]);

    // work out where to place the hole.
    target_y = rng.real()*target_size[1];
    target_z = rng.real()*target_size[2];

    // position the intersection in line with the target
    projectile_path = projectile_path.translate([
        0,
        target_y + target_bounds[0].y,
        target_z + target_bounds[0].z
    ]);

    // Work out depth to place the hole at by cutting a cube through it and getting the bounds
    hit_bounds = intersection([target, projectile_path]).getBounds();

    var target_x = hit_bounds[0].x-0.01;
    if (side){
        target_x = hit_bounds[1].x+0.01;
    }

    // Place the hole at the correct location for cutting.
    hole = hole.translate([
        target_x,
        target_y + target_bounds[0].y,
        target_z + target_bounds[0].z,
    ]);

    return hole;
}


function apply_bullet_holes(seed, target, bullet_count, mpd_iterations){
    var maxDelta = 0.5;
    var maxDiameter = 10;
    var maxDepth = 9;
    var rng = RngFactory.create(seed);

    var holes = [];
    for(var i = 0; i < bullet_count; i++){
        var hole_rng = RngFactory.create(rng.int31());
        var hole = make_bullet_hole(hole_rng.int31(), mpd_iterations, maxDelta, maxDiameter, maxDepth);
        hole = position_bullet_hole(target, hole_rng.int31(), hole);
        holes.push(hole);
    }

    // Union fails with an array of 0;
    if (holes.length > 0){
        for(i = 0; i < holes.length; i++){
            target = difference(target, holes[i]);
        }
    }
    return target;
}

function move_to_zero(obj){
    var lower = obj.getBounds()[0];
    return obj.translate([-lower.x, -lower.y, -lower.z]);
}

function uint31_max(){
    return 2147483647.0;
}

function rand_uint31(){
    var value = uint31_max() * Math.random();
    value = Math.round(value);
    return value;
}

function getParameterDefinitions() {
    var params = [
        {
            name: 'wall_type',
            type: 'choice',
            values: ['Blast Barrier', 'Traffic Barrier'],
            initial: 'Blast Barrier',
            caption: 'Wall type:'
        },
        {
            name: 'top_damage',
            type: 'choice',
            values: ["Yes", "No"],
            initial: "Yes",
            caption: "Surface damage:"
        },
        { name: 'top_seed', type: 'int', min: 0, max: uint31_max(), initial: 2132471456 , caption: "Surface damage seed:" },
        { name: 'top_surf_detail', type: 'int', initial: 5, min: 1, max: 8, caption: "Surface damage detail level:" },
        { name: 'bullet_seed', type: 'int', min: 0, max: uint31_max(), initial: 412449399, caption: "Bullet hole seed:" },
        { name: 'bullet_count', type: 'int', initial: 30, min: 0, max: 50, caption: "Bullet hole count:" },
        { name: 'bullet_hole_detail', type: 'int', initial: 5, min: 2, max: 8, caption: "Bullet hole detail level:" },
    ];

    // Overwrite initial values from query params
    const urlParams = new URLSearchParams(window.location.search);

    for(var i = 0; i < params.length; ++i){
        param_name = params[i].name;
        var value = urlParams.get(param_name);
        if (value != undefined){
            params[i].initial = value;
        }
    }

    return params;
}

function main(params){
    const start = Date.now();

    DiamondSquare();
    HeightMap();
    MidPointDisplacement();
    RngFactory();
    Wall();
    Util();

    var wall_type = params.wall_type;
    var top_seed = params.top_seed;
    var top_damage = params.top_damage === 'Yes';
    var top_detail = params.top_surf_detail;
    var bullet_seed = params.bullet_seed;
    var bullet_count = params.bullet_count;
    var bullet_detail = params.bullet_hole_detail;

    var maxDelta = 0.5;

    top_detail = Math.min(top_detail, 8);
    top_detail = Math.max(top_detail, 0);

    bullet_detail = Math.min(bullet_detail, 8);
    bullet_detail = Math.max(bullet_detail, 2);

    // Make a wall section and get the size
    if (wall_type === 'Traffic Barrier'){
        var wall = Wall.traffic_barrier().scale(1/45);
    } else {
        var wall = Wall.blast_barrier().scale(1/4.5);
    }

    wall = move_to_zero(wall);
    bounds = wall.getBounds();
    wall = wall.center([true, true, false]);

    // Use the max of width and depth to scale the surface damage
    var wall_size = get_size(wall)
    size = Math.max(wall_size[0]+2, wall_size[1]+2);
    mapSize = [size, size, [bounds[1].z+2]];

    // Make the surface damage
    wall = apply_bullet_holes(bullet_seed, wall, bullet_count, bullet_detail);
    if(top_damage) {
        surface = make_surface(top_seed, maxDelta, top_detail);
        var damageMap = HeightMap.to_polyhedron(surface,mapSize);
        damageMap = damageMap.center([true, true, false]);
        wall = intersection(damageMap,wall);
    }

    wall = color([0.5,0.5,0.5],wall);
    const millis = Date.now() - start;
    console.log("took " + millis + "ms");
    return [wall];
}
