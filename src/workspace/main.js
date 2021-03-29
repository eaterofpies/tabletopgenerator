include("DiamondSquare.js");
include("HeightMap.js");
include("MersenneTwister.js");
include("MidPointDisplacement.js");
include("TWall.js");
include("Util.js");



function make_surface(seed, maxDelta, iterations){

    var rng = RngFactory.create(seed);
    var surface =
    [
        [
            rng.realrange(0, maxDelta*2),
            rng.realrange(0, maxDelta*2)
        ],
        [
            rng.realrange(0, maxDelta*2),
            rng.realrange(0, maxDelta*2)
        ]
    ]

    for(var i = 0; i < iterations; i++){
       maxDelta /= 2;
       surface = DiamondSquare.run(rng, surface, maxDelta);
    }

    return surface;
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
    return Util.linear_extrude_scale(points, depth, 0.01).rotateY(90);
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
    hole_bounds = hole.getBounds();
    target_size = get_size(target);

    hole_size = get_size(hole);

    // position in the range of the sides of the wall
    var rng = RngFactory.create(seed);

    // pick a side to do the damage on
    side = rng.real() < 0.5;

    target_y = rng.real()*target_size[1];
    target_z = rng.real()*target_size[2];
    // work out depth by cutting a cube through it and getting the bounds
    // Work out the size of the intersection
    projectile_path = center(true, cube([target_size[0], hole_size[1], hole_size[2]]));

    //position the intersection in line with the target
    projectile_path = projectile_path.translate([0,
        target_y + target_bounds[0].y,
        target_z + target_bounds[0].z
    ]);

    hit_bounds = intersection([target, projectile_path]).getBounds();

    var target_x = hit_bounds[0].x-0.01;
    if (side){
        target_x = hit_bounds[1].x+0.01;
        hole = hole.rotateY(180);
    }

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
        // Doing this iteratively gives more accurate results but takes much longer
        target = difference(target, union(holes));
    }
    return target;
}

function move_to_zero(obj){
    var lower = obj.getBounds()[0];
    return obj.translate([-lower.x, -lower.y, -lower.z]);
}

function center_xy(obj){
    var lower = obj.getBounds()[0];
    obj = obj.translate([-lower.x, -lower.y, 0]);

    var upper = obj.getBounds()[1];
    obj = obj.translate([-upper.x/2, -upper.y/2, 0]);
    return obj;
}

function getParameterDefinitions() {
    return [
        {
            name: 'top_damage',
            type: 'choice',
            values: ["Yes", "No"],
            initial: "Yes",
            caption: "Surface damage:"
        },
        { name: 'top_seed', type: 'int', min: 0, max: 2147483647, initial: 42, caption: "Surface damage seed:" },
        { name: 'top_surf_detail', type: 'int', initial: 5, min: 1, max: 8, caption: "Surface damage detail level:" },
        { name: 'bullet_seed', type: 'int', min: 0, max: 2147483647, initial: 42, caption: "Bullet hole seed:" },
        { name: 'bullet_count', type: 'int', initial: 5, min: 0, max: 50, caption: "Bullet hole count:" },
        { name: 'bullet_hole_detail', type: 'int', initial: 5, min: 2, max: 8, caption: "Bullet hole detail level:" },
      ];
  }

function main(params){
    DiamondSquare();
    HeightMap();
    MidPointDisplacement();
    RngFactory();
    TWall();
    Util();

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

    // Make a twall section and get the size
    var wall = move_to_zero(TWall.create().scale(1/4.5));

    bounds = wall.getBounds();
    wall = center_xy(wall);

    // Use the max of width and depth to scale the surface damage
    size = Math.max(bounds[1].x+2, bounds[1].y+2);
    mapSize = [size, size, [bounds[1].z+2]];

    // Make the surface damage
    wall = apply_bullet_holes(bullet_seed, wall, bullet_count, bullet_detail);
    if(top_damage){
        surface = make_surface(top_seed, maxDelta, top_detail);
        var damageMap = HeightMap.to_polyhedron(surface,mapSize);
        damageMap = center_xy(damageMap);
        wall = intersection(damageMap,wall);
    }

    var wall = color([0.5,0.5,0.5],wall);
    return [center(true,wall)];
}
