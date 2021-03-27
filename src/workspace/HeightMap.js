
function to_cubes(pts){
    var chunks = [];

    var size = pts.length;
    for(var x = 0; x < size; x++ ){
        for(var y = 0; y < size; y++){
            chunks.push(cube([1,1,pts[x][y]+1]).translate([x,y,0]));
        }
    }
    return union(chunks);
}

function to_polyhedron(data, scale){
    var sizeX = data.length;
    var sizeY = data[0].length;

    var scaleX = scale[0] / (sizeX-1);
    var scaleY = scale[1] / (sizeY-1);
    var scaleZ = scale[2];

    var vert_ids = {};
    var vert_list = [];
    var tri_list = [];
    var vert_no = 0;

    function point_to_name(x, y, z){
        var name = x + " " + y + " " + z;
        return name;
    }

    function add_vert(x, y, z){
            var layer = 't';
            if (z == 0){
                layer = 'b'
            }

            vert_ids[point_to_name(x,y, layer)] = vert_no;
            vert_no++;

            // ensure that it never actually goes to 0 height
            // as it would be non manifold
            var height = Math.max(z * scaleZ, 0.01);

            vert_list.push([x*scaleX, y*scaleY, height])
    }

    // top vertices
    for (var y = 0; y < sizeY; y++){
        for (var x = 0; x < sizeX; x++){
            add_vert(x, y, data[x][y])
        }
    }

    // bottom vertices around edge
    var max_x = sizeX - 1
    var max_y = sizeY - 1
    for (var x = 0; x < sizeX; x++){
        add_vert(x, 0, 0);
    }

    for (var y = 0; y < sizeY; y++){
        add_vert(max_x, y, 0);
    }

    for (var x = max_x; x >= 0; x--){
        add_vert(x, max_y, 0);
    }

    for (var y = max_y; y >= 0; y--){
        add_vert(0, y, 0);
    }

    // middle of bottom
    add_vert(max_x/2, max_y/2, 0);


    function gen_tris(v1, v2, v3, v4){
        tri_list.push([v1,v2,v3]);
        tri_list.push([v3,v2,v4]);
    }

    // Top triangles
    for (var y = 0; y < sizeY - 1; y++){
        for (var x = 0; x < sizeX - 1; x++){
            v1 = vert_ids[point_to_name(x, y, 't')]
            v2 = vert_ids[point_to_name(x+1, y, 't')]
            v3 = vert_ids[point_to_name(x, y+1, 't')]
            v4 = vert_ids[point_to_name(x+1, y+1, 't')]
            gen_tris(v1,v2,v3,v4);
        }
    }

    // side triangles
    for (var x = 0; x < sizeX - 1; x++){
        // l face
        v1 = vert_ids[point_to_name(x, 0, 't')];
        v2 = vert_ids[point_to_name(x+1, 0, 't')];
        v3 = vert_ids[point_to_name(x, 0, 'b')];
        v4 = vert_ids[point_to_name(x+1, 0, 'b')];
        gen_tris(v2, v1, v4, v3);

        // r face
        v1 = vert_ids[point_to_name(x, max_y, 't')];
        v2 = vert_ids[point_to_name(x+1, max_y, 't')];
        v3 = vert_ids[point_to_name(x, max_y, 'b')];
        v4 = vert_ids[point_to_name(x+1, max_y, 'b')];
        gen_tris(v1, v2, v3, v4);
    }

    // front and back triangles
    for (var y = 0; y < sizeY - 1; y++){
        // front
        v1 = vert_ids[point_to_name(0, y, 't')];
        v2 = vert_ids[point_to_name(0, y+1, 't')];
        v3 = vert_ids[point_to_name(0, y, 'b')];
        v4 = vert_ids[point_to_name(0, y+1, 'b')];
        gen_tris(v1, v2, v3, v4);

        //back
        v1 = vert_ids[point_to_name(max_x, y, 't')];
        v2 = vert_ids[point_to_name(max_x, y+1, 't')];
        v3 = vert_ids[point_to_name(max_x, y, 'b')];
        v4 = vert_ids[point_to_name(max_x, y+1, 'b')];
        gen_tris(v2, v1, v4, v3);
    }

    // bottom triangles
    for (var x = 0; x < sizeX - 1; x++){
        v1 = vert_ids[point_to_name(max_x/2, max_y/2, 'b')];
        v2 = vert_ids[point_to_name(x, 0, 'b')];
        v3 = vert_ids[point_to_name(x+1, 0, 'b')];
        tri_list.push([v2,v1,v3]);
    }

    for (var y = 0; y < sizeY - 1; y++){
        v1 = vert_ids[point_to_name(max_x/2, max_y/2, 'b')];
        v2 = vert_ids[point_to_name(max_x, y, 'b')];
        v3 = vert_ids[point_to_name(max_x, y+1, 'b')];
        tri_list.push([v2,v1,v3]);
    }

    for (var x = sizeX - 2; x >=0; x--){
        v1 = vert_ids[point_to_name(max_x/2, max_y/2, 'b')];
        v2 = vert_ids[point_to_name(x+1, max_y, 'b')];
        v3 = vert_ids[point_to_name(x, max_y, 'b')];
        tri_list.push([v2,v1,v3]);
    }

    for (var y = sizeY - 2; y >=0; y--){
        v1 = vert_ids[point_to_name(max_x/2, max_y/2, 'b')];
        v2 = vert_ids[point_to_name(0, y+1, 'b')];
        v3 = vert_ids[point_to_name(0, y, 'b')];
        tri_list.push([v2,v1,v3]);
    }

    // reverse the winding. TODO make this optional
    for (var i = 0; i < tri_list.length; i++){
        var triangle = tri_list[i]
        a = triangle[0];
        b = triangle[1];
        c = triangle[2];
        tri_list[i] = [a, c, b];
    }

    return polyhedron({triangles: tri_list, points: vert_list});
}


function to_points(heights, scale){
    var points = [[0,0]];
    var widthStep = scale[0]/(heights.length);

    for(var i = 0; i < heights.length; i++){
        var point = [
            i * widthStep,
            Math.max(heights[i]*scale[1], 0.01)
        ];

        points.push(point);
    }
    points.push([(points.length-1) * widthStep, 0]);
    return points;
}


function to_points_circular(heights, scale){
    var arcStep = (2*Math.PI) / heights.length;

    var points = [];
    for(var i = 0; i < heights.length-1; i++){
        var height = Math.max(heights[i]*scale, 0.01)
        var point = [
            Math.sin(i*arcStep) * height,
            Math.cos(i*arcStep) * height
        ];

        points.push(point);
    }
    return points;
}


HeightMap=function(){
    HeightMap.to_cubes = function(pts){
        return to_cubes(pts);
    }

    HeightMap.to_polyhedron = function(pts, scale){
        return to_polyhedron(pts, scale);
    }

    HeightMap.to_points = function(heights, scale){
        return to_points(heights, scale);
    }

    HeightMap.to_points_circular = function(heights, scale){
        return to_points_circular(heights, scale);
    }

}
