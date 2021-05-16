function RandomSeed(){
    return Math.floor(Math.random() * 2147483647.0);
}

function RandomSeeds(){
    document.getElementsByName('top_seed')[0].value = RandomSeed();
    document.getElementsByName('bullet_seed')[0].value = RandomSeed();
    document.getElementById('updateButton').click();
}

function NameTheThings(){
    // select boxes don't have IDs or names so set the names
    param_table = document.getElementsByClassName('parameterstable')[0];
    for (let row of param_table.rows)
    {
        cells = row.cells;
        if (cells[0].innerText == 'Wall type:'){
        cells[1].childNodes[0].name = 'wall_type';
        } else if (cells[0].innerText == 'Surface damage:'){
        cells[1].childNodes[0].name = 'top_damage';
        }
    }
}

function GetParameter(name){
    // The controls don't have id's set so find them by name
    return document.getElementsByName(name)[0].value;
}


function SetParameter(name, value){
    // The controls don't have id's set so find them by name
    return document.getElementsByName(name)[0].value = value;
}

const param_names = [
    'wall_type',
    'top_damage',
    'top_seed',
    'top_surf_detail',
    'bullet_seed',
    'bullet_count',
    'bullet_hole_detail',
    'bullet_hole_max_diameter',
    'bullet_hole_min_depth',
    'bullet_hole_max_depth'
];

function GetParameters(){
    var params = {};
    for(var i = 0; i < param_names.length; ++i){
        var param = param_names[i];
        var value = GetParameter(param);
        params[param] = value;
    }
    return params;
}

function MakeUrl(params){
    var precursor = '?';
    var url_params = "";
    for(var i = 0; i < param_names.length; ++i){
        var param = param_names[i]
        // The controls don't have id's set so find them by name
        var value = params[param];
        url_params += precursor + encodeURIComponent(param) + '=' + encodeURIComponent(value);
        precursor = '&';
    }

    var url = location.protocol + '//' + location.host + location.pathname + url_params;
    return url;
}


function MakeUrlFromParams(){
    params = GetParameters();
    return MakeUrl(params);
}

function GetUrl(){
    NameTheThings();
    var url = MakeUrlFromParams();
    navigator.clipboard.writeText(url);
}

function Search(search_left = true){
    NameTheThings();

    DiamondSquare();
    RngFactory();

    if (GetParameter('top_damage') == 'Yes'){
        // Make the current surface (low poly)
        rng = RngFactory.create(GetParameter('top_seed'));
        orig_surf = DiamondSquare.make_surface(rng, 0.5, 1);
    }
    else {
        // if this has no top surface damade assume they want
        // a damaged section next to this one.
        // They can use the randomise button otherwise.
        orig_surf = [[1,1,1],[1,1,1],[1,1,1]];
    }

    var i = 0;
    const min_metric = 0.05;
    var metric = min_metric + 1;
    while(metric > min_metric){
        i++;
        seed = RandomSeed();
        rng = RngFactory.create(seed);
        guess_surf = DiamondSquare.make_surface(rng, 0.5, 1);
        metric = 0;
        size = orig_surf.length;
        // left is -ve in Y which is a bit silly
        for (var x = 0; x < size; x++){
            if (search_left){
                error = (orig_surf[x][0] - guess_surf[x][size-1]);
            }
            else{
                error = (orig_surf[x][size-1] - guess_surf[x][0]);
            }
            metric += error*error;
        }
        metric = Math.sqrt(metric / orig_surf.length);
        console.log(metric);
    }

    console.log("Found in " + i + " iterations " + metric);

    params = GetParameters()
    params['top_seed'] = seed
    params['bullet_seed'] = RandomSeed();
    params['top_damage'] = 'Yes';
    window.open(MakeUrl(params),'_blank');
}

function SearchLeft(){
    Search(true)
}

function SearchRight(){
    Search(false)
}
