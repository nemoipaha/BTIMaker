var BTIBaseObject = {
    wallPath: function (rect) {
        var path = new Array();
        for (var i in rect) path.push("L", rect[i]['x'], rect[i]['y']);
        path.push("Z");
        path[0] = "M";
        return path;
    },
    selected : function(type){
        var element = BTIAppController['papers'].currentElement(type);
        if(!element) return false;
        return (element['id'] == this['id']);
    },
    nearByType:function(current,compairer,type){
        var pair = [current.getBBox(),compairer.getBBox()],flag = null;
        switch(type){
            case 'left': flag = (parseInt(pair[0]['cx'] - pair[1]['cx']) > 0);
                break;
            case 'right': flag = (parseInt(pair[0]['cx'] - pair[1]['cx']) < 0);
                break;
            case 'top': flag = (parseInt(pair[0]['cy'] - pair[1]['cy']) > 0);
                break;
            case 'bottom': flag = (parseInt(pair[0]['cy'] - pair[1]['cy']) < 0);
                break;
            default: return null;
        }
        return (flag  ? current : compairer);
    },
    nearByAxis:function(current,compairer,old,min){
        var pair = [current.getBBox(), compairer.getBBox()],
            dx = parseInt(Math.abs(pair[0]['cx'] - pair[1]['cx'])),
            dy = parseInt(Math.abs(pair[0]['cy'] - pair[1]['cy']));
        if(!dx){
            if(min) if(min['y'] > dy) return null;
            return ((pair[0]['cy'] < pair[1]['cy'])? 'bottom':'top');
        }
        if(!dy){
            if(min) if(min['x'] > dy) return null;
            return ((pair[0]['cx'] > pair[1]['cx']) ? 'left':'right');
        }
        return null;
    }
}