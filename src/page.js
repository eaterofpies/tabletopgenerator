function RandomSeeds(){
    document.getElementsByName('top_seed')[0].value = Math.floor(Math.random() * 2147483647.0);
    document.getElementsByName('bullet_seed')[0].value = Math.floor(Math.random() * 2147483647.0);
    document.getElementById('updateButton').click();
}

function MakeUrl(){
    const param_names = [
        'wall_type',
        'top_damage',
        'top_seed',
        'top_surf_detail',
        'bullet_seed',
        'bullet_count',
        'bullet_hole_detail'
    ]

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

    var precursor = '?';
    var url_params = "";
    for(var i = 0; i < param_names.length; ++i){
        var param = param_names[i]
        // The controls don't have id's set so find them by name
        var value = document.getElementsByName(param)[0].value
        url_params += precursor + encodeURIComponent(param) + '=' + encodeURIComponent(value);
        precursor = '&';
    }

    var url = location.protocol + '//' + location.host + location.pathname + url_params;
    return url;
}

function GetUrl(){
var url = MakeUrl();
navigator.clipboard.writeText(url);
}
