BTIAppController['type-manager'].types['wall'].create = function(points){
    // Передаем объекты двух точек (начала и конца), на основе которых будет строиться объект стена
    var paper = BTIAppController['papers'].currentContext();// Получаем текущий контекст рисования
    if(!paper || !points) return null;// И проверяем его на валидность
    var object = new wall(points,Object.assign({},this['opt']),this['callbacks']);
    if(object){
        object['room-marker'] = false;
        object.recreate(paper);
    }
    return object;
}
BTIAppController['type-manager'].types['wall'].callbacks = {
    transform: function(point,wall,mode){
        if(typeof wall == 'boolean'){
            mode = wall;
            wall = null;
        }
        var position = point.getCenterCoord(),
            array = BTIAppController['papers'].getObjectsByType('wall'),
            walls = new Array(),
            temp;
        if(wall) array.push(wall);
        for (var i in array) {
            temp = array[i].isHasPoint(point);
            if(temp){
                var item = {
                    pair:new String(temp),
                    other: {marker: (temp == 'start') ? 'end' : 'start'},
                    wall:array[i],
                    holes:[]
                };
                temp = array[i].centerInModifitedPoints();
                item['other']['position'] = array[i].points[item['other']['marker']].getCenterCoord();
                item['rect'] =  Math.wallRect(position,temp,parseFloat(
                    BTIAppController['type-manager'].types['wall'].opt['thickness']));
                item['angle'] = Math.angleByDirection(temp,position);
                temp = array[i]['holes'];
                if (temp.length) {
                    for (var j in temp) item['holes'].push({
                        hole: temp[j],
                        margin: Math.lineWidth(
                            temp[j].getCenterPosition(),
                            item['other']['position']
                        )
                    });
                    item['holes'].sort((a, b)=> {
                        return a['margin'] - b['margin'];
                    });
                }
                walls.push(item);
            }
        }
        if(walls.length == 1){
            wall = walls[walls.length - 1];
            temp = 1;
            if(wall['pair'] == 'end') temp++;
            wall['wall'].setPointByRectIndex(temp,wall['rect'][0]);
            temp = 5;
            if(wall['pair'] == 'end') temp--;
            wall['wall'].setPointByRectIndex(temp,wall['rect'][3]);
            wall['wall'].updateCurvedPoints();
        }
        if(walls.length > 1) {
            walls.sort(function (a, b) {
                return a['angle'] - b['angle'];
            });
            var draw = function (current, old) {
                current = walls[current];
                old = walls[old];
                var flags = {
                    old: ((0 <= old['angle']) && (old['angle'] <= Math.PI)),
                    current: ((0 <= current['angle']) && (current['angle'] <= Math.PI))
                }, cross = Math.crossPoint(
                    old.rect[((flags['old']) ? 2 : 0)],
                    old.rect[((flags['old']) ? 3 : 1)],
                    current.rect[((flags['current']) ? 0 : 2)],
                    current.rect[((flags['current']) ? 1 : 3)]
                );
                old['wall'].setPointByRectIndex((
                    ((old['pair'] == 'start') ?
                            ((flags['old']) ? 5 : 1) :
                            ((flags['old']) ? 4 : 2)
                    )), cross);
                old['wall'].updateCurvedPoints();
                current['wall'].setPointByRectIndex((
                    ((current['pair'] == 'start') ?
                            ((flags['current']) ? 1 : 5) :
                            ((flags['current']) ? 2 : 4)
                    )), cross);
                current['wall'].updateCurvedPoints();

            }, length = walls['length'];
            for (var i = 1; i < length; i++) draw(i, i - 1);
            draw(0, length - 1);
        }
        for(var i in walls){
            temp = walls[i]['holes'];
            walls[i].wall['holes'] = new Array();
            if(temp.length) for(var j in temp) {
                var points = BTIAppController['type-manager'].types['wall'].callbacks['valid-point'].apply(walls[i].wall, [{
                    current: Math.pointByPairForDistance(
                        walls[i]['other']['position'],
                        position,temp[j]['margin']
                    ), type: temp[j].hole['type'],
                    width:{ main : temp[j].hole.getHalfWidth()}
                }]);
                if (points){
                    walls[i].wall['holes'].push(temp[j]['hole']);
                    temp[j]['hole'].redraw({
                         thickness: temp[j]['hole'].opt['thickness'],
                         points: points
                    });
                } else {
                    var hole = BTIAppController['papers'].currentElement('door', temp[j]['hole'].paper);
                    if(hole && hole.id == temp[j]['hole'].id) {
                        BTIAppController['type-manager'].types[hole['type']].callbacks['click'].call(hole,false);
                        if(typeof BTIAppController['callbacks'].hide == 'function') BTIAppController['callbacks'].hide();
                    }
                    BTIAppController['papers'].removeElement(temp[j]['hole'].id,temp[j]['hole'].paper);
                }
            }
        }
        // Тут нужно почистить !
        var rooms = new Array();
        for(var i in walls) {
            temp = BTIAppController['papers'].equal(walls[i].wall['id'], 'room',point['paper']);
            for(var j in temp) if(rooms.indexOf(temp[j]['id']) == -1) rooms.push(temp[j]);
        }
        for(var i in rooms) rooms[i].redraw();

        if(mode) for(var i in walls)
            BTIAppController['type-manager'].types['wall'].callbacks['transform'](
                walls[i]['wall']['points'][walls[i]['other']['marker']]
            );
        wall = BTIAppController['papers'].currentElement('wall',point['paper']);
        if(wall)  BTIAppController['type-manager'].types['wall'].callbacks['invalidate'].apply(wall);
        if (BTIAppController['callbacks']['update']) BTIAppController['callbacks'].update();
    },
    redraw: function() {
        BTIAppController['type-manager'].types['wall'].callbacks['transform'](this.points['start'],this);
        BTIAppController['type-manager'].types['wall'].callbacks['transform'](this.points['end'],this);
    },
    'valid-point': function(opt,hole) {
        if((["simple-door","sliding-door","double-door","window"].indexOf(opt['type']) == -1)||
           !opt['type'] || !opt['current'] || this.type != 'wall') return false; // Проверка на существование необходимых свойств у объекта
        var path = this.element[0].attr("path"),holes = new Array();
        // Отступ от точек основания стены равен радиусу объекта точка
        opt['padding'] = parseFloat(BTIAppController['type-manager'].types['point'].opt['radius']) +
                         parseFloat(BTIAppController['type-manager'].types['point'].opt['stroke-width']);
        opt.points = {
            start:{
                top:{
                    x: parseFloat(path[1][1]),
                    y: parseFloat(path[1][2])
                }, bottom:{
                    x: parseFloat(path[5][3]),
                    y: parseFloat(path[5][4])
                }, base:{
                    x: parseFloat(path[0][1]),
                    y: parseFloat(path[0][2])
                }
            },end:{
                top:{
                    x: parseFloat(path[2][3]),
                    y: parseFloat(path[2][4])
                }, bottom:{
                    x: parseFloat(path[4][1]),
                    y: parseFloat(path[4][2])
                }, base:{
                    x: parseFloat(path[3][1]),
                    y: parseFloat(path[3][2])
                }
            },
            center: this.centerInModifitedPoints()
        };
        opt.points['start']['border'] = Math.perpendicularPoint((
            Math.nearPointByPointsPair(
                opt.points['center'],
                opt.points['start']['top'],
                opt.points['start']['bottom']
            )?  opt.points['start']['bottom']:
                opt.points['start']['top']
        ),opt.points['start']['base'],
          opt.points['end']['base']
        );
        opt.points['end']['border'] = Math.perpendicularPoint((
            Math.nearPointByPointsPair(
                opt.points['center'],
                opt.points['end']['top'],
                opt.points['end']['bottom']
            ) ? opt.points['end']['bottom']:
                opt.points['end']['top']
        ),opt.points['start']['base'],
          opt.points['end']['base']
        );
        opt['current'] = Math.perpendicularPoint(
            opt['current'],
            opt.points['start']['border'],
            opt.points['end']['border']
        );
        if(parseInt(Math.lineWidth(
              opt.points['start']['border'],
              opt['current']
           ) + Math.lineWidth(
               opt.points['end']['border'],
               opt['current']
           )) > parseInt(Math.lineWidth(
                opt.points['end']['border'],
                opt.points['start']['border'])
            )) return false;
        for (var i in this.holes) {
            if(hole) if(hole['id'] == this.holes[i]['id']) continue;
            var item = this.holes[i].getFoundationPoints();
            holes.push(item['start'], item['end']);
        }
        if(!opt['ignore-mode']) opt['ignore-mode'] =  !holes.length;
        if(!opt['ignore-mode'] && !opt['translate-mode']) {
            holes.push(opt.points['start']['border'], opt.points['end']['border'], opt['current']);
            holes.sort(function (start, end) {
                return (Math.nearPointByPointsPair(opt.points['end']['border'], start, end) ? 1 : -1);
            });
            var index = holes.findIndex(function (element) {
                return (opt['current']['x'] == element['x'] && opt['current']['y'] == element['y']);
            });
            if (index == 0 || index == (holes.length - 1)) return null;
            opt.points['start']['border'] = holes[index + 1];
            opt.points['end']['border'] = holes[index - 1];
        }

        // Тут в качестве width берется полива длины, создаваемего объекта (для удобства,чтобы сравнивать текущую точку и отрезки от данной к точкам основания)
        if(!opt['width']) opt['width'] = {};
        if(!opt['width']['main']) opt['width']['main'] = parseFloat(BTIAppController['type-manager'].types[opt['type']].opt['width']); // Базовая длина создаваемого объекта
        if(!opt['width']['min']) opt['width']['min'] = parseFloat(BTIAppController['type-manager'].types[opt['type']].opt['min-width']); // Минимально - допустимая длина создаваемого объекта

        if(opt['width']['main'] < opt['width']['min']) return false; // Отступа от точек основания стены и минимально допустимой длины встраиваемоего объекта должны быть не больше,чем базовая допустимая длина объекта
        if(Math.lineWidth(opt.points['start']['border'],opt.points['start']['base']) < opt['padding'])
            opt.points['start']['border'] = Math.pointByPairForDistance(
                opt.points['start']['border'],
                opt.points['end']['base'],
                opt['padding']
            );
        opt['width']['start'] = Math.lineWidth(
            opt.points['start']['border'],
            opt['current'] // Расстояния от текущей точки до точки начала основания стены
        );
        if(Math.lineWidth(opt.points['end']['border'],opt.points['end']['base']) < opt['padding'])
            opt.points['end']['border'] = Math.pointByPairForDistance(
                opt.points['end']['border'],
                opt.points['start']['base'],
                opt['padding']
            );
        opt['width']['end'] = Math.lineWidth(
            opt['current'],// Расстояния от текущей точки до точки конца основания стены
            opt.points['end']['border']
        );
        opt['flags'] = {  // Сравнение отрезков (вынесено для удобства)
            min:{
                end: (opt['width']['end'] < opt['width']['min']),
                start:(opt['width']['start']  < opt['width']['min'])
            },
            main:{
                end: (opt['width']['end'] < opt['width']['main']),
                start:(opt['width']['start']  < opt['width']['main'])
            }
        };

        // Необходимо чтобы расстояние от текущей точки к начальной и конечной точек основания стены были не меньше,чем минимально допустимая длина
        if(opt.flags['min']['start'] && opt.flags['min']['end']) return false;
        if(opt.flags['main']['start'] || opt.flags['main']['end']) {
            // Если расстояние от текущей точки к точкам основания больше чем минимально допустимая длина,
            // Но меньше чем базовая длина, то в качестве текущей точки берем точку срединную точку самой стены
            if (BTIAppController['papers'].paperOpt("wall-sel-min",this.paper)) {
                if(opt.flags['min']['start'] || opt.flags['min']['end']) return false;
                opt['width']['main'] = Math.min(
                    opt['width']['end'],
                    opt['width']['start']
                );
            } else {
                if(((opt['width']['start'] + opt['width']['end'])/2) < opt['width']['main']) return false;
                if (opt.flags['main']['start'])
                    opt['current'] = Math.pointByPairForDistance(
                        opt.points['start']['border'],
                        opt.points['end']['border'],
                        opt['width']['main']
                    );
                if (opt.flags['main']['end'])
                    opt['current'] = Math.pointByPairForDistance(
                        opt.points['end']['border'],
                        opt.points['start']['border'],
                        opt['width']['main']
                    );
            }
        }
        var points = {
            start: Math.pointByPairForDistance(opt['current'],
                opt.points['start']['border'],
                opt['width']['main']
            ),
            end: Math.pointByPairForDistance(opt['current'],
                opt.points['end']['border'],
                opt['width']['main']
            )
        };
        if(!opt['ignore-mode']&& opt['translate-mode']) {
            var intersect = function(mode) {
                return (((Math.min(this.c[mode],this.d[mode]) -
                          Math.max(this.a[mode],this.b[mode]))
                * ((Math.max(this.c[mode],this.d[mode]) -
                    Math.min(this.a[mode],this.b[mode])))) < 0);
            };
            points['crossing'] = false;
            for(var i = 0;i < holes.length; i+=2){
                var binder = intersect.bind({
                    a: holes[i + 1],
                    b: holes[i],
                    c: points['start'],
                    d: points['end']
                });
                if(binder('x') || binder('y')){
                    points['crossing'] = true;
                    break;
                }
            }
        }
        return points;
    },
    'default-path':function(start,end,thickness){
        if (!start || !end || !thickness) { // Если в опции не пришлел какой-то из параметров,
            // Есть вариант, что функция была вызвана через apply с непосредственным указанием this объекта стены в качестве родителя
            if (!this.points['start'] || !this.points['end'] || !this.opt['thickness']) return null; // Собственно проверка
            thickness = parseFloat(this.opt['thickness']); // И толщину стены из опций
            start = this.points['start']; // Получаем координаты середины точек основания (начала и конца) стены
            end = this.points['end'];
        }
        var positions = [start.getCenterCoord(), end.getCenterCoord()],
            rect = Math.wallRect(positions[0],positions[1],thickness),// Получаем координаты прямоугольника стены
            path = new Array(); // Необходимо "перегнать" координаты стены в удобный для Raphael формат
        for (var i in rect) {
            var temp = parseInt(i);
            if((temp % 2)) {
                temp = Math.centerPoint(rect[i-1],rect[i]);
                path.push("Q",temp['x'],temp['y'],rect[i]['x'], rect[i]['y']);
            }else{
                temp/= 2;
                path.push("L",positions[temp]['x'],positions[temp]['y']);
                path.push("L", rect[i]['x'], rect[i]['y']);
            }
        }
        path.push("Z"); // "Z" - маркер-команда для замыкания полигона
        path[0] = "M"; // "M" - маркер-команда для начала отрисовки  полигона
        return path;
    },
    'mouse-up': function(){
        if(this['type'] != 'wall') return;
        if(BTIAppController['papers'].paperOpt('draw-mode',this['paper']))
            BTIAppController['papers'].setCurrentElement('wall',this,this['paper']);
    },
    'mouse-down': function(){
        if(this['type'] != 'wall') return;
        if(BTIAppController['papers'].paperOpt('draw-mode',this['paper']))
            BTIAppController['papers'].setCurrentElement('wall',null,this['paper']);
    },
    move: function(dx,dy){
        if(!this['element']) return;
        var object = BTIAppController['type-manager'].types['point'],
            start = {
                x: parseFloat(this.points['start']['ox']) + parseFloat(dx),
                y: parseFloat(this.points['start']['oy']) + parseFloat(dy)
            },end ={
                x: parseFloat(this.points['end']['ox']) + parseFloat(dx),
                y: parseFloat(this.points['end']['oy']) + parseFloat(dy)
            }
        if(object.callbacks['in-box'].call(this.points['start'],start)
        && object.callbacks['in-box'].call(this.points['end'],end)){
           object.callbacks['move'].apply(this.points['start'],[dx,dy]);
           object.callbacks['move'].apply(this.points['end'],[dx,dy]);
        }
    },
    click: function(flag){
        if(BTIAppController['papers'].paperOpt('draw-mode',this['paper'])
            || this['type'] != 'wall' || !this['element']) return;
        var wall = this;
        if(!wall['sub-boxes']) wall['sub-boxes'] = {
            'curved-box': null,
            'edit-box': null,
            'remove-box':null,
            'hide-box':null
        };
        for (var i in wall['sub-boxes']) {
            if (!wall['sub-boxes'][i]) wall['sub-boxes'][i] =
                BTIAppController['papers'].getElementById(i,true,wall['paper']);
            if (!wall['sub-boxes'][i]) wall['sub-boxes'][i] =
                BTIAppController['papers'].createElement('service-button',{image: i},i,true,wall['paper']);
            if (!wall['sub-boxes'][i]) return;
        }
        //door.select(flag);
        var invalidate = BTIAppController['type-manager'].types['wall'].callbacks['invalidate'].bind(wall),
            element = BTIAppController['papers'].currentElement('wall',wall['paper']);
        if(element) {
            if (element['id'] == wall['id']){
                if(flag){
                    invalidate();
                    return;
                }
                for (var i in wall['sub-boxes']) wall['sub-boxes'][i].hide();
            }
            if(flag) BTIAppController['type-manager'].types['wall'].callbacks['click'].call(element,false);
        }
        if(!flag) {
            BTIAppController['papers'].setCurrentElement('wall',null,wall['paper']);
            delete wall['sub-boxes'];
            return;
        }
        BTIAppController['papers'].setCurrentElement('wall',wall,wall['paper']);
        element = BTIAppController['papers'].currentElement('door',wall['paper']);
        if(element) BTIAppController['type-manager'].types[element['type']].callbacks['click'].call(element,false);

        wall['sub-boxes']['remove-box'].callbacks({
            dblclick:()=>{
                if(typeof BTIAppController['callbacks']['remove'] == 'function') BTIAppController['callbacks'].remove();
                BTIAppController['type-manager'].types['wall'].callbacks['remove'].apply(this);
            }
        });
        wall['sub-boxes']['hide-box'].callbacks({
            dblclick:()=>{
                BTIAppController['type-manager'].types['wall'].callbacks['click'].call(this,false);
                if(typeof BTIAppController['callbacks']['hide'] == 'function') BTIAppController['callbacks'].hide();
            }
        });
        for(var i in wall['sub-boxes'])  wall['sub-boxes'][i].show();
        invalidate();
    },
    remove:function(){
        if(this['type'] != 'wall'  || !this['element']) return;
        var rooms = BTIAppController['papers'].equal(this.id,'room',this['paper']);
       if(rooms.length){
            if(rooms.length > 1){
                rooms[1].addWall(rooms[0].getWallsArray(),false);
                rooms[1].removeWall(this['id']);
            }
            BTIAppController['papers'].removeElement(rooms[0].id,this['paper']);
        }
        var current = BTIAppController['papers'].removeElement('door', this['paper']);
        if(current) BTIAppComponent['type-manager'].types[current['type']].callbacks['remove'].apply(current);

        for(var i in this.holes)
            BTIAppController['papers'].removeElement(this.holes[i].id, this['paper']);

        BTIAppController['type-manager'].types['wall'].callbacks['click'].call(this,false);
        BTIAppController['papers'].removeElement(this['id'],this['paper']);
        var walls = BTIAppController['papers'].getObjectsByType('wall'),
            flags = {
                start:false,
                end:false
            }
        for(var i in walls){
            if(walls[i].isHasPoint(this.points['start'])) flags['start'] = true;
            if(walls[i].isHasPoint(this.points['end'])) flags['end'] = true;
            if(flags['start'] && flags['end']) break;
        }
        for(var i in flags) {
            if (flags[i])  BTIAppController['type-manager'].types['wall'].callbacks['transform'](this.points[i]);
            else BTIAppController['papers'].removeElement(this.points[i].id, this['paper']);
        }

    },
    invalidate:function(){
        if(this['type'] != 'wall' || !this['sub-boxes'] || !this['element']) return;
        var width = parseFloat(this['sub-boxes']['edit-box'].opt['radius']),
            rect = Math.wallRect(
                this.points['start'].getCenterCoord(),
                this.points['end'].getCenterCoord(),
                parseFloat(this.opt['thickness']) + width +
                parseFloat(this.opt['text']['padding']) +
                parseFloat(this.opt['text']['font-size'])
        ), points = {
           'curved-box': Math.centerPoint(rect[0], rect[1]),
           'edit-box': Math.centerPoint(rect[2], rect[3])
        };
        points['hide-box'] = Math.pointByPairForDistance(points['edit-box'],rect[3],
            width + parseFloat(this['sub-boxes']['hide-box'].opt['radius']) * 2
        );
        points['remove-box'] = Math.pointByPairForDistance(points['edit-box'],rect[2],
            width + parseFloat(this['sub-boxes']['remove-box'].opt['radius']) * 2
        );
        for(var i in this['sub-boxes'])
            this['sub-boxes'][i].setPosition(
                points[i].x,
                points[i].y
            ).toFront();
    },
    changeText: function(value){
        if(typeof BTIAppController['callbacks'].scale == 'function')
            value *= BTIAppController['callbacks'].scale(this['paper']);
        return value.toFixed(2).toString();
    }
}

BTIAppController['type-manager'].types['wall'].createFromDB = function(opt){
    var paper = BTIAppController['papers'].currentContext();// Получаем текущий контекст рисования
    if(!paper) return null;// И проверяем его на валидность
    var object = new wall(opt['points'],Object.assign({},this['opt']),this['callbacks']);
    if(object){
        object['room-marker'] = false;
        object.recreate(paper,opt['positions']);
    }
    return object;
}

function wall(points,opt,callbacks){
    this.opt = opt;
    this.points = points;
    this.type = 'wall';
    this.holes = new Array();
    this.curved = { x: 0, y: 0 };
    this.recreate = function(paper,points){
        this.remove();
        var path;
        if (!points) {
            path = callbacks['default-path'].apply(this);
        } else {
            path = ["M"];
            for (var i in points) {
                if (i == 2 || i == 6) path.push("Q");
                else if (i != 3 && i != 7 && i != 0) path.push("L");
                path.push(points[i].x, points[i].y);
            }
            path.push("Z");
        }
        this.element = paper.set([
            paper.path(path).attr(this['opt']).toFront()
            .dblclick(()=>{
                if(typeof callbacks['click'] == 'function') callbacks['click'].call(this,true);
            }).hover(()=>{
                if(typeof callbacks['mouse-up'] == 'function') callbacks['mouse-up'].apply(this);
                this.element[0].attr({ fill: this.opt['hover-fill'] });
            },()=>{
                if(typeof callbacks['mouse-down'] == 'function') callbacks['mouse-down'].apply(this);
                this.element[0].attr({ fill: this.opt['fill']});
            }).drag((dx,dy)=>{
                if(typeof callbacks['move'] == 'function') callbacks['move'].apply(this,[dx,dy]);
            },()=>{
                var box = this['element'].getBBox();
                this['ox'] = parseFloat(box['cx']);
                this['oy'] = parseFloat(box['cy']);
                this.points['start']['ox'] = parseFloat(this.points['start']['element'].attr("cx"));
                this.points['start']['oy'] = parseFloat(this.points['start']['element'].attr("cy"));
                this.points['end']['ox'] = parseFloat(this.points['end']['element'].attr("cx"));
                this.points['end']['oy'] = parseFloat(this.points['end']['element'].attr("cy"));
            },()=>{
                delete this['ox'];
                delete this['oy'];
                delete this.points['start']['ox'];
                delete this.points['start']['oy'];
                delete this.points['end']['ox'];
                delete this.points['end']['oy'];
            }),
            paper.text().attr(this.opt['text']),
            paper.text().attr(this.opt['text'])
        ]);
        this.points['start']['element'].toFront();
        this.points['end']['element'].toFront();
        if(!points && typeof callbacks['redraw'] == 'function') callbacks['redraw'].apply(this);
        else{
             this.updateText(true);
             this.updateText(false);
        }
    }
    this.remove = function(){
        if(!this['element']) return false;
        this['element'].remove();
        // delete this;
        return true;
    }
    this.hasHole = function(object){
        for(var i in this.holes) if(this.holes[i]['id'] == object['id']) return true;
        return false;
    }
    this.compare = function(wall){
        if(!wall) return false;
        if(wall['type'] != 'wall' || !wall['points']) return false;
        if(this['id'] == wall['id']) return true;
        return (
            (wall.points['start'].compare(this.points['start'])
          || wall.points['start'].compare(this.points['end']))
          &&(wall.points['end'].compare(this.points['start'])
          || wall.points['end'].compare(this.points['end']))
        );
    };
    this.isHasPoint = function(point){
        if(typeof  point  == 'undefined') return false;
        if(typeof point['id']== 'undefined'){
            if(this.points['start'].compare(point)) return 'start';
            if(this.points['end'].compare(point)) return 'end';
        }
        if(this.points['start'].id == point['id']) return 'start';
        if(this.points['end'].id == point['id']) return 'end';
        return null;
    };
    this.centerInModifitedPoints = function(){
        if(!this.element || !this.points) return null;
        if(!this.element.attr("path")) return null;
        if(!this.curved['x'] && !this.curved['y'])
            return Math.centerPoint(
                this.points['start'].getCenterCoord(),
                this.points['end'].getCenterCoord()
            );
        else {}
        return null;
    }
    this.updateText = function(flag) {
        if(!this['element'] || !this['points']) return false;
        var path = this.element[0].attr("path");
        if(!path) return false;
        var text,start = {
            x: parseFloat(path[0][1]),
            y: parseFloat(path[0][2])
        },end = {
            x: parseFloat(path[3][1]),
            y: parseFloat(path[3][2])
        },rect = Math.wallRect(start,end,
            parseFloat(this.getThickness()/2) +
            parseFloat(this.opt['text']['padding'])
        ),angle = Math.PI/2 - Math.angleByDirection(end,start);
        if((end['x'] - start['x']) < 0) angle += Math.PI;
        angle*= - Math.RADIAN;
        if(flag) {
            rect = Math.centerPoint(rect[0], rect[1]);
            text = Math.lineWidth({
                x: parseFloat(path[1][1]),
                y: parseFloat(path[1][2])
            },{
                x: parseFloat(path[2][3]),
                y: parseFloat(path[2][4])
            });
            flag = 1;
        }else {
            rect = Math.centerPoint(rect[2], rect[3]);
            text = Math.lineWidth({
                x: parseFloat(path[4][1]),
                y: parseFloat(path[4][2])
            },{
                x: parseFloat(path[5][3]),
                y: parseFloat(path[5][4])
            });
            flag = 2;
        }
        this.element[flag].rotate(
            -this.element[flag]['matrix'].split()['rotate']).attr({
                x: rect['x'],
                y: rect['y'],
                text: callbacks['changeText'].call(this,text)
            }).rotate(angle);
    }
    this.setPointByRectIndex = function(index,point){
        if(!this['element'] || !this['points'] || index < 0 || index > 5) return false;
        var path = this.element[0].attr("path");
        if(!path) return false;
        var temp = (index == 2 || index  == 5);
        path[index][(temp ? 3: 1)] = point['x'];
        path[index][(temp ? 4: 2)] = point['y'];
        if(index != 0){
            temp = this.points['start'].getCenterCoord();
            path[0][1] = temp['x'];
            path[0][2] = temp['y'];
        }
        if(index != 3) {
            temp = this.points['end'].getCenterCoord();
            path[3][1] = temp['x'];
            path[3][2] = temp['y'];
         }
        this['element'].attr({ path:path });
        this.updateText(index > 3);
        return true;
    }
    this.pointByRectIndex  = function(index){
        if(!this['element'] || !this['points'] || index < 0 || index > 5) return false;
        var path = this.element[0].attr("path");
        if(!path) return false;
        var temp = (index == 2 || index  == 5);
        return {
            x: parseFloat(path[index][(temp ? 3: 1)]),
            y: parseFloat(path[index][(temp ? 4: 2)])
        }
    }
    this.getArrayOfFoundationPoints = function(){
        var array = [];
        if(this['element']){
            var path = this.element[0].attr('path');
            for(var i in path){
                switch(path[i].length){
                    case 3:
                        array.push({
                            x: parseFloat(path[i][1]),
                            y: parseFloat(path[i][2])
                        });
                        break;
                    case 5:
                        array.push({
                            x: parseFloat(path[i][1]),
                            y: parseFloat(path[i][2])
                        });
                        array.push({
                            x: parseFloat(path[i][3]),
                            y: parseFloat(path[i][4])
                        });
                        break;
                }
            }
        }
        return array;
    }
    this.getThickness = function(){
        if(!this['element'] || !this['points']) return null;
        var path = this.element[0].attr("path");
        if(!path) return false;
        var points = {
            start:{
                x:parseFloat(path[0][1]),
                y:parseFloat(path[0][2])
            },end:{
                x:parseFloat(path[3][1]),
                y:parseFloat(path[3][2])
            },top:{
                x:parseFloat(path[2][1]),
                y:parseFloat(path[2][2])
            },bottom:{
                x:parseFloat(path[5][1]),
                y:parseFloat(path[5][2])
            }
        }
        return Math.lineWidth(points['top'],
          Math.perpendicularPoint(points['top'],
              points['start'],points['end'])) +
        Math.lineWidth(points['bottom'],
            Math.perpendicularPoint(points['bottom'],
                points['start'],points['end']));
    }
    this.updateCurvedPoints = function(){
        if(!this['element'] || !this['points']) return false;
        if(!this['element'].attr("path")) return false;
        var path = this.element[0].attr("path");
        if(!path) return false;
        if(!this.curved['x'] && !this.curved['y']){
            var temp = Math.centerPoint({
                x: parseFloat(path[1][1]),
                y: parseFloat(path[1][2])
            },{
                x: parseFloat(path[2][3]),
                y: parseFloat(path[2][4])
            });
            path[2][1] = temp['x'];
            path[2][2] = temp['y'];
            temp = Math.centerPoint({
                x: parseFloat(path[4][1]),
                y: parseFloat(path[4][2])
            },{
                x: parseFloat(path[5][3]),
                y: parseFloat(path[5][4])
            });
            path[5][1] = temp['x'];
            path[5][2] = temp['y'];
        } else {} // Для кривых дописать решение
        this.element[0].attr({ path:path });
        return true;
    }
    return this;
}