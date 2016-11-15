BTIAppController['type-manager'].types['room'].create = function(){
    var paper = BTIAppController['papers'].currentContext();
    if(!paper) return null; // Если отсутствует контекст возвращаем null в качестве объекта
    var opt = Object.assign({},this['opt']);

    delete opt['icon'];
    delete opt['categoryId'];

    var object = new room(opt,this['callbacks']);
    if(object) object.recreate(paper);
    return object;
};
BTIAppController['type-manager'].types['room'].createFromDB = function(walls){
    var paper = BTIAppController['papers'].currentContext();
    if(!paper) return null; // Если отсутствует контекст возвращаем null в качестве объекта
    var opt = Object.assign({},this['opt']);

    delete opt['icon'];
    delete opt['categoryId'];

    var object = new room(opt,this['callbacks']);
    if(object) {
        for(var i in walls){
            var item = BTIAppController['papers'].getElementById(walls[i]);
            if(item) object.walls[walls[i]] = item;
        }
        object.recreate(paper);
        object.redraw();
    }
    return object;
}
function room(opt){
    this.opt = opt;
    this.walls = {};
    this.type = 'room';

    this.addWall = function(objects,flag){
        if(!Array.isArray(objects))objects = [objects];
        for(var i in objects) {
            if (objects[i].type != 'wall') continue;
            objects[i]['room-marker'] = true;
            this.walls[objects[i].id] = objects[i];
        }
        if(typeof flag == 'undefined') flag = true;
        if(flag) this.redraw();
    }
    this.getWallsArray = function(){
        return Object.keys(this.walls).map((key)=>{return this.walls[key]});
    }
    this.getFoundationPoints = function(mode){
        var array = new Array();
        if(mode) for (var i in this.walls)
                for (var j in this.walls[i].points) {
                    var item = this.walls[i].points[j]['id'];
                    if (item && array.indexOf(item) == -1) array.push(item);
                }
        else for (var i in this.walls)
            for (var j in this.walls[i].points) {
                var item = this.walls[i].points[j];
                if (array.findIndex((e)=> {
                        return (e['id'] == item['id'])
                    }) == -1) array.push(item);
       }
        return array;
    }
    this.remove = function(){
        if(!this['element']) return false;
        this['element'].remove();
        return true;
    }
    this.recreate = function(paper,flag){
        this.remove();
        this['element'] = paper.path().attr(this.opt);
        if(flag) this.redraw();
    }
    this.removeWall = function(objects,flag) {
        if (!Array.isArray(objects)) objects = [objects];
        for (var i in objects) {
            if (typeof objects[i] == 'object') {
                if (objects[i].type != 'wall') continue;
                else objects[i] = objects[i].id;
            }
            delete this.walls[objects[i]];
        }
        if(typeof flag == 'undefined') flag = true;
        if(flag) this.redraw();
    }
    this.redraw = function(){
        if(!this['element'])  return;
        var array = Object.keys(this.walls).map((i)=>{return this['walls'][i];}),
            length = array['length'] - 1,
            path = [{
                wall: array[length],
                position:'start'
            }];
        array.splice(length,1);
        while(array['length']){
            var item  = path[path['length'] - 1];
            for(var i in array) {
                var position = array[i].isHasPoint(item['wall'].points[item['position']]);
                if(position){
                    path.push({
                        wall:array[i],
                        position:((position == 'start') ? 'end':'start')
                    });
                    array.splice(i,1);
                    break;
                }
            }
        }
        array = ["M"];
        for(var i in path){
            var point = path[i]['wall'].points[path[i]['position']].getCenterCoord();
            array.push(point['x'],point['y'],"L");      // Решение (ТОЛЬКО ДЛЯ ПРЯМЫХ)
        }
        array[array.length - 1] = "Z";
        this['element'].attr({ path:array}).toBack();
    }
    this.compare = function(objects){
        if(!Array.isArray(objects)) objects = [objects];
        for(var i in objects) {
            if (typeof objects[i] == 'object') {
                if (objects[i].type != 'wall') return false;
                else objects[i] = objects[i].id;
            }
            if(!this.walls[objects[i]])  return false;
        }
        return true;
    }
}