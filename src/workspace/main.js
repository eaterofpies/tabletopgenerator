include("MersenneTwister.js");
include("HeightMap.js");
include("DiamondSquare.js");
include("TWall.js");

function getParameterDefinitions() {
  return [
      { name: 'seed', type: 'int', min: 0, max: 2147483648, initial: 42, caption: "Random seed:" },
      { name: 'detail', type: 'int', initial: 5, min: 1, max: 9, caption: "Surface detail:" }
    ];

}

function make_surface(seed, maxDelta, iterations){

    var surf_rng = RngFactory.create(params.seed);
    var surface =
    [
        [
            maxDelta + surf_rng.genrand_real_scale(maxDelta),
            maxDelta + surf_rng.genrand_real_scale(maxDelta)
        ],
        [
            maxDelta + surf_rng.genrand_real_scale(maxDelta),
            maxDelta + surf_rng.genrand_real_scale(maxDelta)
        ]
    ]

    for(var i = 0; i < iterations; i++){
        maxDelta /= 2;
       surface = DiamondSquare.run(surf_rng, surface, maxDelta);
    }

    return surface;
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

function main(params){
    RngFactory();
    HeightMap();
    DiamondSquare();
    TWall();

    var maxDelta = 0.5;

    // Make a twall section and get the size
    var wall = move_to_zero(TWall.create().scale(1/4.5));

    bounds = wall.getBounds();

    // Use the max of width and depth to scale the surface damage
    size = Math.max(bounds[1].x+2, bounds[1].y+2);
    mapSize = [size, size, [bounds[1].z+2]];

    // Make the surface damage
    surface = make_surface(params.seed, maxDelta, params.detail);

    var damageMap = HeightMap.to_poly(surface,mapSize);

    damageMap = center_xy(damageMap);
    wall = center_xy(wall);
    var obj = color([0.5,0.5,0.5],intersection(damageMap, wall));

    return [obj];
}
