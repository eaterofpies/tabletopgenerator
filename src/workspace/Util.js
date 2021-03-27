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

Util=function(){
    Util.linear_extrude_scale = function(pts, height, scale){
        return linear_extrude_scale(pts, height, scale);
    }
}
