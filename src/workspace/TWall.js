_tWallWidth = 180;
_tWallHeight = 300; //400;
_tWallDepth = 120;


function twall_section(){
    sectionDepth = _tWallDepth/3;
    return translate([0,0,0],
        union(
            cube([sectionDepth , _tWallWidth, _tWallHeight]),
            twall_low_section(),
            twall_low_section().rotateZ(180).translate([sectionDepth, _tWallWidth, 0])
        )
    );
}

function twall_low_section(){
    sectionDepth = _tWallDepth /3;
    width = _tWallWidth -(sectionDepth /3);
    return difference(
            cube([sectionDepth,width,_tWallDepth]),
            cube([80,80,_tWallHeight]).rotateZ(45).translate([0,-73,0]),
            cube([80,80,_tWallHeight]).rotateZ(45).translate([0,width-40,0]),
            cube([80,_tWallWidth,_tWallHeight]).translate([-80,0,0]).rotateY(40).translate([0,0,30])
        ).translate([-sectionDepth, 0, 0]);
}

function twall() {
    cutWidth = _tWallDepth/9;
    cutDepth = cutWidth *2;
    return difference(
        twall_section(),
        cube([cutDepth, cutWidth, _tWallHeight]).translate([cutWidth,0,0]),
        cube([cutDepth, cutWidth, _tWallHeight]).translate([0,_tWallWidth-cutWidth,0])
    );
}

TWall=function(){
    TWall.create = function(){
        return twall();
    }
}
