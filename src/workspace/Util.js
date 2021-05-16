function linear_extrude_scale(pts, height, scale){
    pts_3d = [];
    pt_count = pts.length
    for (var i = 0; i < pt_count; i++){
        pt = pts[i]
        pts_3d.push([pt[0], pt[1], 0])
        pts_3d.push([pt[0]*scale, pt[1]*scale, height])
    }

    tris = [];
    for (var i = 0; i < pts_3d.length; i+=2){
        function calc_offset(n){
            return (i + n) % pts_3d.length;
        }
        tris.push([calc_offset(0),calc_offset(2),calc_offset(1)]);
        tris.push([calc_offset(2),calc_offset(3),calc_offset(1)]);
    }

    // don't add the middle points yet
    // as the indexing gets harder
    var bm = pts_3d.length;
    var tm = pts_3d.length+1;
    for (var i = 0; i < pts_3d.length+1; i+=2){
        bottom = [bm, (i+2)%pts_3d.length, i%pts_3d.length]
        top = [tm, bottom[2]+1, bottom[1]+1]

        tris.push(bottom);
        tris.push(top);
    }

    // bottom and top middle
    pts_3d.push([0, 0, 0]) -1;
    pts_3d.push([0, 0, height]) -1;

    return polyhedron({triangles:tris, points:pts_3d});
}

function closed_triangle_fan_pair(pts, height){
    pts_3d = [];
    pt_count = pts.length
    for (var i = 0; i < pt_count; i++){
        pt = pts[i]
        pts_3d.push([pt[0], pt[1], 0])
    }

    // don't add the middle points yet
    // as the indexing gets harder
    var bm = pts_3d.length;
    var tm = pts_3d.length+1;

    tris = [];
    for (var i = 0; i < pts_3d.length; i+=1){
        function calc_offset(n){
            return (i + n) % pts_3d.length;
        }
        tris.push([calc_offset(1),calc_offset(0),bm]);
        tris.push([calc_offset(0),calc_offset(1),tm]);
    }

    // bottom and top middle
    pts_3d.push([0, 0, 0]);
    pts_3d.push([0, 0, height]);

    return polyhedron({triangles:tris, points:pts_3d});
}

// Returns the intersection point if the lines intersect, otherwise 0. In addition, if the lines
// intersect the intersection point may be stored in the floats i_x and i_y.
function get_line_intersection(p0, p1, p2, p3){
    const s1 = [p1[0] - p0[0], p1[1] - p0[1]];
    const s2 = [p3[0] - p2[0], p3[1] - p2[1]];

    const s = (-s1[1] * (p0[0] - p2[0]) + s1[0] * (p0[1] - p2[1])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
    const t = ( s2[0] * (p0[1] - p2[1]) - s2[1] * (p0[0] - p2[0])) / (-s2[0] * s1[1] + s1[0] * s2[1]);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        return [p0[0] + (t * s1[0]), p0[1] + (t * s1[1])];
    }

    // No collision
    return null;
}

function alloc_2d(size){
    var out = new Array(size[0]);
    for(var i = 0; i < out.length; i++){
        out[i] = new Array(size[1]);
    }
    return out;
}


Util=function(){
    Util.linear_extrude_scale = function(pts, height, scale){
        return linear_extrude_scale(pts, height, scale);
    }

    Util.closed_triangle_fan_pair = function(pts, height){
        return closed_triangle_fan_pair(pts, height);
    }

    Util.get_line_intersection = function(p0, p1, p2, p3){
        return get_line_intersection(p0, p1, p2, p3);
    }

    Util.alloc_2d = function(size){
        return alloc_2d(size);
    }
}
