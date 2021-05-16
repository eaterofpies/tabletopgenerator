include("MersenneTwister.js");;
include("Util.js");

function uint31_max(){
    return 2147483647.0;
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

function lookup_2d(container, idx){
    return container[idx[0]][idx[1]];
}

function make_brick(points, point_idx){
    const point = points[point_idx[0]][point_idx[1]]

    function get_point_at_offset(offset){
        x_idx = point_idx[0] + offset[0];
        y_idx = point_idx[1] + offset[1];
        point_val = points[x_idx][y_idx];

        return [offset[0] + point_val[0], offset[1] + point_val[1]];
    };

    const offsets = [
        [-1,-1],
        [0,-1],
        [1,-1],
        [1,0],
        [1,1],
        [0,1],
        [-1,1],
        [-1,0]
    ];


    var brick = square({size:[2,2], center: true});
    cut = []
    for(var i = 0; i < offsets.length; ++i){
        const other_pt = get_point_at_offset(offsets[i]);

        const vec = [ other_pt[0] - point[0], other_pt[1] - point[1]]
        const dist = Math.sqrt((vec[0] * vec[0]) + (vec[1]*vec[1]));
        // Angle from +ve x axis to pt
        const angle = Math.atan2(vec[1], vec[0])*(180/Math.PI);

        other_brick = square({size:[1,2], center: false}).center([false, true]).translate([dist/2,0]).rotateZ(angle);
        //brick = union(brick, other_brick);
        cut.push(other_brick);
        brick = difference(brick, other_brick);
    }

    return brick; //union(cut);
}

function get_rand_point(rng, it){
    var x = 0;
    var y = 0;

    for (var i =0; i < it; ++i){
        x += rng.real();
        y += rng.real();
    }

    x /= it;
    y /= it;
    return [x,y]
}


function main(params){

    RngFactory();
    Util();

    size = [10,10]
    // overallocate as we need points past the edges
    points = Util.alloc_2d([size[0] + 2, size[1] + 2])
    rng = RngFactory.create(42);

    // generate the center points of the blocks
    for(var x = 0; x < points.length; x++){
        for(var y = 0; y < points[x].length; y++){
            points[x][y] = get_rand_point(rng, 4);
        }
    }


    // Draw the centers
    out = []
        /*
    for(var x = 0; x < points.length; x++){
        for(var y = 0; y < points[x].length; y++){
            scale_factor = 10;
            var point = points[x][y];
            x_pos = (x*scale_factor) + (point[0] * scale_factor);
            y_pos = (y*scale_factor) + (point[1] * scale_factor);
            out.push(CAG.circle({center: [x_pos, y_pos], radius: 1, resolution: 32}));
        }
    }
    */

    // iterate through the visible points

    const scale_factor = 1;

    for(var x = 0; x < points.length; x++){
        for(var y = 0; y < points[x].length; y++){
            // iterate through the points near this point
            var point = points[x][y];
            x_pos = (x*scale_factor) + (point[0] * scale_factor);
            y_pos = (y*scale_factor) + (point[1] * scale_factor);
            out.push(cylinder({d: 0.1, h: 1, center: true}).translate([x_pos, y_pos, 0]))
        }
    }


    bricks = []
    for(var x = 1; x < points.length-1; x++){
        for(var y = 1; y < points[x].length-1; y++){
            // iterate through the points near this point
            var point = points[x][y];
            x_pos = (x*scale_factor) + (point[0] * scale_factor);
            y_pos = (y*scale_factor) + (point[1] * scale_factor);
            brick = linear_extrude({ height: 1 }, make_brick(points, [x,y]).scale(0.9).translate([x+point[0], y+point[1],0]))
            bricks.push(brick);
        }
    }




    //out.push(CAG.circle({center: [0, 0], radius: 1, resolution: 32}));
    console.log(out);
    return bricks;
}
