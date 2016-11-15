BTIAppController['type-manager'].types['point'].create = function(opt) {
    var paper = BTIAppController['papers'].currentContext(); // Текущий контекст
    if(!paper) return null;
    var equals = BTIAppController['papers'].equal(opt, 'point'), // Список объектов типа точка совпадающие по размещению
        old = BTIAppController['papers'].currentElement('point'), // Получаем выбранную точку
        walls = BTIAppController['papers'].getObjectsByType('wall'),// Массив стен
        points = BTIAppController['papers'].getObjectsByType('point'),
        wall =  BTIAppController['papers'].currentElement('wall'),// Выделенная стена,в случае если пользователь решил "разбить" существующую стену
        box = BTIAppController['papers'].getElementById('service-wall',true), // Вспомогательный объект для отрисовки стены
        current = null,position,show = function(position){
            if(box){ // Если удалось создать вспомогательный объект для отрисовки стен
                box.show(); // Отображаем объект
                box.setStartPoint(position); // Указываем стартовую позицию,в том же месте где создаваемая точка
            }
        },room,temp;
    if(!box) box = BTIAppController['papers'].createElement('service-wall','service-wall',true);
    if (equals['length']){ // Если существуют точки по тем же координатам, что для и текущей создавемой линии
        current = equals[equals['length'] - 1]; // Берем последнюю из них (в общем случае не планируется больше одной)
        position = current.getCenterCoord(); // Получем координаты центра текущей "точки"
        var dx = Math.abs(position['x'] - opt['x']), dy = Math.abs(position['y'] - opt['y']);// Получаем абсолютную разницу в значениях координатах
        temp = (parseInt(this.opt['radius']) + parseInt(this.opt['stroke-width'])) * 4; // Длина окружности двойной ((радиус + обводка)окружности)
        if(temp > dx && dy < temp){ // Разница между координатами точки должны быть в пределе длины окружности,который описывает объект точка
            show(position);
            BTIAppController['papers'].setCurrentElement('point', current); // Устанавливаем найденную точку,как текущую
            if (current.compare(old)) return null; //Выходим - Если пред идущая выбранная точка и точка,которую мы выбрали одна и таже
            for (var i in walls) // Обходим массив всех стен текущего холста
                if(walls[i].isHasPoint(current) && walls[i].isHasPoint(old)) // Если позвователем был выбран путь от одной крайней точки двери к другой точке
                return null;// Возвращаем null т.к. создавать новый объект безсмысленно
        }
    }
    if(wall) { // Если пользователь решил "разбить" существующую стену на части (Данное решение не точное (РАБОТАЕТ ДЛЯ ПРЯМЫХ))
        var pair = wall['points']; // Получаем опорные точки основания стены
        pair = { // Пересобираем в удобный формат (ссылка на объект "точка", реальные координаты точки на холсте)
            start:{
                point: pair['start'],
                position: pair['start'].getCenterCoord()
            },end:{
                point: pair['end'],
                position: pair['end'].getCenterCoord()
            }
        };
        // Если пользователь решил разбить объект стена на составляющие,это означает, что он кликнули по объекту стена и
        // Необходимо опустить перпендикуляр от координаты клика на прямую основания, для того чтобы пропорционально разделить прямую
        position = Math.perpendicularPoint(opt,
            pair['start']['position'],
            pair['end']['position']
        );
        current = new point(Object.assign({},this['opt']), this['callbacks']);// Создаем точку
        if (!current.recreate(paper,opt)) return null; // Если точку невозможно создать - возвращаем null
        // Если существует предидущая текущая точка - необходимо проверить: "Принадлежит ли она текущему выбранному объекту стена?"
        // Для проверки создания нового объекта "стена" от текущей выбранной точки к созданой, с учетов двух новосозданных объектов
        var other = (old ? wall.isHasPoint(old): false),holes = wall['holes'],id = wall['id'],// Получаем список объектов типа "отверстие", которые необходимо будет "перегнать" по новым создаваемым объектам "стена"
            rooms = BTIAppController['papers'].equal(id,'room');
        BTIAppController['papers'].removeElement(id); // Удаляем выбранный объект "стена"
        var divided = { // Создаем два новых объекта "стена" и получаем ссылки на них в дополнительный объект
            start:{ // Точка начала "старой стены" - точка разрыва
                wall: BTIAppController['papers'].createElement('wall', {
                    start: pair['start']['point'],
                    end: current
                })
            }, end: {// Точка разрыва  - точка окончания "старой стены"
                wall: BTIAppController['papers'].createElement('wall', {
                    start: current,
                    end: pair['end']['point']
                })
            }
        };
        if(holes.length){ // Если существует список объектов типа "отверстия" для разбиваемой стены  необходимо "перегнать" объекты относительно двух вновьсозданных стен
            for (var i in holes) holes[i] = { // Переганяем массив объектов в удобный формат
                hole: holes[i], // Ссылка на объект "отверстие"
                point: holes[i].getCenterPosition() // Получаем серединную точку основания
            }
            var callback = function(element,mode){ // Функция фильтрации
                // Чтобы оперделить к какой части "старой стены" относительно точки искривления
                // Необходимо сравнить длины объектов от точки начала/конца,в зависимости от части стены
                // к точкам объекта "отверстие"  и точки разрыва и найти меньшую по значению
                return Math.nearPointByPointsPair(
                    pair[mode]['position'],// Точка начала/конца
                    element['point'],// Позиционирование елемента
                    position // Точка разрыва стены
                );
            };// Собственно производим фильтрацию
            divided['start']['holes'] = holes.filter((e)=>{ return callback(e,'end');});
            divided['end']['holes'] =  holes.filter((e)=>{ return callback(e,'start');});
            // Далее необходимо перерисовать объекты относительно новосозданных стен, так как границы могут быть изменены
            callback = function(mode){
                for(var i in divided[mode]['holes']) { // Обходим массив стен
                    var item =  divided[mode]['holes'][i];
                    // Проверяем валидность расположения объекта относительно новосозданной стены
                    item['points'] = BTIAppController['type-manager'].types['wall'].callbacks['valid-point'].apply(
                        divided[mode]['wall'],[{// в качестве this новосозданная стена
                            type: item['hole']['type'],// Тип объекта "отверстие"
                            current: item['point'], // Точка расположения объекта "отверстие"
                            width: { main:item['hole'].getHalfWidth()} // В сновной длины - половина длины объекта "отверстие"
                        }]
                    );
                    if(item['points']){ // В случае если объект прошел валидацию
                        item['hole'].redraw({
                            points: item['points']
                        },divided[mode]['wall']);// Так же указываем текущую стену в качестве parent
                        item['hole'].toFront(); // При перерисовке сторонние объекты могут перекрыть текущий объект "отверстие"
                    } else BTIAppController['papers'].removeElement(item['hole'].id);
                }
            }
            // Вызываем перерисовку для каждой из стен
            if(divided['start']['holes'].length) callback('start');
            if(divided['end']['holes'].length) callback('end');
        }
        walls.splice(walls.findIndex((e)=>{ return (e['id'] == wall['id']);}),1);
        walls.push(divided['start']['wall'],divided['end']['wall']);
        for(var i in rooms ) {
            rooms[i].removeWall(id,false);
            rooms[i].addWall([
                divided['start']['wall'],
                divided['end']['wall']
            ]);
            if(!other) {
                temp = rooms[i].getFoundationPoints(true);
                if (old &&  (temp.indexOf(old['id']) != -1) && (temp.indexOf(current['id']) != -1)) room = i;
            }
            if(room != i) rooms[i].redraw();
        }
        if(other){ // В случае если "разбиение" объекта стены было произведено из одной из точек основания дальнейшие операции не имеют смысла
            show(opt);
            return current;
        }
        if(room)  room = rooms[room];
    }
    if (old) { // В случае если существует уже "текущая" выбранная точка, при создании новой будет автоматически создан объект "стена"
       temp = {
           old:old.getCenterCoord(),
           current:((current)? current.getCenterCoord() : opt)
       };

        // Данное решение не точное (РАБОТАЕТ ДЛЯ ПРЯМЫХ)
        //--------------------------------------------------------------------------//
       for (var i in walls) // Необходимо сделать объод всех объектов стен на отсутствие факта перечения с другими объектами типа "стена"
           if (Math.crossCutsPoint(temp['old'],temp['current'],
               walls[i].points['start'].getCenterCoord(), // (old to current) with (start[i] to end[i])
               walls[i].points['end'].getCenterCoord()) // Нахождение точки пересечения двух ИМЕННО отрезков
           )return null; // Если перечение было найдено, то создать опорную точку и объект стена невозможно
        //--------------------------------------------------------------------------//
    }
    if(!current) { // Если не обло ранее создано объект точка самое врема создать его хД =)
       current = new point(Object.assign({},this['opt']), this['callbacks']);
       if (!current.recreate(paper,opt)) return null; // В случае если создание не удалось - выходим
    } else opt = current.getCenterCoord();
    // В случае если существует уже "текущая" выбранная точка, создаем объект стена
    if (old) {
        wall = BTIAppController['papers'].createElement('wall',{
            start: old,
            end: current
        });
        if(wall) walls.push(wall);
        if(room) room.addWall(wall,false);
    }
    if(walls['length'] > 2) {
        var cycles = [], visited = {}, id = current['id'],
            cycleFinder = function (cycle) {
                var u = cycle.points[cycle['points'].length - 1];
                if (u != id) visited[u] = true;
                else if (cycle['points'].length >= 2) {
                    for(var i in cycles)
                        if (cycle['points'].slice().reverse().toString() ==
                            cycles[i]['points'].toString()) return;
                    cycles.push(cycle);
                    return;
                }
                for (var i in walls) {
                    if (i == cycle['walls'][cycle['walls'].length - 1]) continue;
                    var indexes = {
                        start: walls[i].points['start'].id,
                        end: walls[i].points['end'].id
                    }, array = {
                        points: cycle['points'].slice(),
                        walls: cycle['walls'].slice()
                    };
                    if (!visited[indexes['end']] && indexes['start'] == u) {
                        array['points'].push(indexes['end']);
                        array['walls'].push(i);
                        cycleFinder(array);
                        visited[indexes['end']] = false;
                    }
                    else if (!visited[indexes['start']] && indexes['end'] == u) {
                        array['points'].push(indexes['start']);
                        array['walls'].push(i);
                        cycleFinder(array);
                        visited[indexes['start']] = false;
                    }
                }
            };

        if (typeof id == 'undefined') points.push(current);
        for (var i in points) visited[points[i]['id']] = false;
        if(room)  walls = room['walls'];
        cycleFinder({
            points: [id],
            walls: [-1]
        });
        if (room) {
            BTIAppController['papers'].removeElement(room['id']); // Удаляем выбранный объект "комната"
            for(var i in cycles){
                temp = cycles[i]['walls'];
                if(temp['length']  == Object.keys(walls)['length']) continue;
                room = BTIAppController['papers'].createElement('room');
                if (room) {
                    temp.splice(0, 1);
                    for(var j in temp) temp[j] = walls[temp[j]];
                    room.addWall(temp);
                }
            }
        } else if(cycles['length']){
            var frame = { power: Number.MAX_VALUE };
            for (var i in cycles) {
                var power = 0;
                temp = cycles[i]['walls'];
                temp.splice(0, 1);
                for (var j in temp) {
                    temp[j] = walls[temp[j]];
                    if (temp[j]['room-marker']) power++;
                }
                if (power >= frame['power']) break;
                frame = {
                    power: power,
                    object: temp
                };
            }
            if(frame['object']) {
                temp = BTIAppController['papers'].createElement('room');
                if (temp) temp.addWall(frame['object']);
            }
        }
    }
    show(opt);
    // В случае, если текущий объект после процедуры всех проверок оказажется уже существующим в общем списке,
    // необходимо исключить возможность создания дублирующего объекта, поэтому необходима проверка по id
    // т.к. любой уже созданный объект имеет общий идентификатор в менеджере объектов
    return ((current['id']) ? null : current);
}
// Флаг - маркер: каждая создающая точка при добавлении в общий список объектов становиться текущей автоматически
BTIAppController['type-manager'].types['point'].incumbent = true;
BTIAppController['type-manager'].types['point'].createFromDB = function(opt){
    var object= new point(Object.assign({},this['opt']), this['callbacks']);
    if (!object.recreate(BTIAppController['papers'].currentContext(),opt)) return null; // В случае если создание не удалось - выходим
    return object;
}
BTIAppController['type-manager'].types['point'].callbacks = {
    'in-box':function(position,paper,width){ // Проверка на вадидность создаваемоего объекта в рамках холста
        if(this.type != 'point') return false; //
        if(!paper){
            if(!this['element']) paper = BTIAppController['papers'].currentContext(this['paper']);
            else paper = this['element'].paper;
        } // Если не пришел контекст для рисования, прийдеться исспользовать текущий
        if(!width) {
            width = parseInt(this.opt['radius']) + parseInt(this.opt['stroke-width']);
        } // допустимая длина отступа = радиус + толщина обводки
        return (position['x'] + width < paper['width'] && position['y'] + width < paper['height']
                && (position['x'] - width) > 0 && (position['y'] - width) > 0)
    },
    down:function(){
        if(!this['element']) return;
        this.near = {
            top: null,
            left: null,
            right: null,
            bottom: null
        };
        for(var i in this.near) this.near[i] = this['element']['paper'].path().attr(this.opt['near-line']);
    },
    move:function(dx,dy,paper){
        if(!this['element']) return false;
        var position  = {
            x: parseFloat((this['ox'] != null &&  dx != null) ? (this['ox'] + dx) : this['element'].attr("cx")),
            y: parseFloat((this['oy'] != null &&  dy != null) ? (this['oy'] + dy) : this['element'].attr("cy"))
        },width = parseFloat(this.opt['radius']) + parseFloat(this.opt['stroke-width']);
        if(BTIAppController['type-manager'].types['point'].callbacks['in-box'].apply(this,[position,paper,width])){
             var walls = { // Необходимо сделать объод всех объектов стен на отсутствие факта перечения с другими объектами типа "стена"
                 in: new Array(),
                 out: BTIAppController['papers'].getObjectsByType('wall',this['paper'])
             },corrected = true;

            // Данное решение не точное (РАБОТАЕТ ДЛЯ ПРЯМЫХ)
            //--------------------------------------------------------------------------//
             for (var i in walls['out']) {
                 var item = walls['out'][i].element[0].attr("path"),
                     marker = walls['out'][i].isHasPoint(this),
                     points = [{
                         x:item[1][1],
                         y:item[1][2]
                     },{
                         x:item[2][3],
                         y:item[2][4]
                     },{
                         x:item[4][1],
                         y:item[4][2]
                     },{
                         x:item[5][3],
                         y:item[5][4]
                     }];
                 if (marker) walls['in'].push(points);
                 else walls['out'][i] = points;
             }
             walls['out'] = walls['out'].filter((e)=>{ return Boolean(!e['id']);});
             for(var i in walls['in']) // Данное решение не точное (РАБОТАЕТ ДЛЯ ПРЯМЫХ)
                 for(var j in walls['out']) {
                     if (Math.crossCutsPoint(walls['in'][i][0],walls['in'][i][1],
                             walls['out'][j][0], walls['out'][j][1]) ||
                         Math.crossCutsPoint(walls['in'][i][0], walls['in'][i][1],
                             walls['out'][j][2], walls['out'][j][3]) ||
                         Math.crossCutsPoint(walls['in'][i][2], walls['in'][i][3],
                             walls['out'][j][0], walls['out'][j][1]) ||
                         Math.crossCutsPoint(walls['in'][i][2], walls['in'][i][3],
                             walls['out'][j][2], walls['out'][j][3])
                     ) corrected = false;
                 }
            //--------------------------------------------------------------------------//

            if(corrected || !this['corrected']) this['corrected'] = position;
            else position = this['corrected'];
            this['element'].attr({ cx: position['x'], cy: position['y']});
            if(this['near']) {
                if (BTIAppController['papers']['near']) {
                    var near = BTIAppController['papers']['near'].apply(
                        BTIAppController['papers'], [{
                            min: {
                                x: width,
                                y: width
                            },
                            key: this['id'],
                            type: 'point'
                        }], this['paper']
                    );
                    for (var i in near) {
                        var current = this['near'][i];
                        if (near[i]) {
                            var box = near[i].getBBox();
                            current.attr({
                                path: [
                                    "M", position['x'], position['y'],
                                    "L", box['cx'], box['cy']
                                ]
                            }).toFront().show();
                        } else current.hide();
                    }
                }
            }
            BTIAppController['type-manager'].types['wall'].callbacks['transform'](this,true);
            return true;
        }
    },
    leave: function(){
        for(var i in this['near']) if(this['near'][i]) this['near'][i].remove();
        delete this['corrected'];
        delete this['near'];
    }
}

function point(opt,callbacks){
    this.type = "point";
    this.opt = opt;
    this.recreate = function(paper,position){
        // Координата точки должна быть в рамках масштабов холста
        if(!callbacks['in-box'].apply(this,[position,paper])) return false;
        this.remove(); // Удаляем старые ссылки на объекты Raphael.js
        for(var i in this.near) this.near[i] = paper.path().attr(this.opt['near-line']).hide();
        this.element = paper.circle(position['x'],position['y'],opt['radius'])
            .attr(this['opt']).hover(()=>{
                this['element'].attr({ fill: opt['hover-fill'] });
            },()=>{
                this['element'].attr({ fill: opt['fill'] });
            }).drag((dx,dy)=>{
                if(callbacks['move']) callbacks['move'].apply(this,[dx,dy,paper]);
                else this['element'].attr({
                    cx: parseFloat(this['ox']) + parseFloat(dx),
                    cy: parseFloat(this['oy']) + parseFloat(dy)
                });
            },()=>{
                if(callbacks['down']) callbacks['down'].apply(this);
                this['ox'] = parseFloat(this['element'].attr("cx"));
                this['oy'] = parseFloat(this['element'].attr("cy"));
            },()=>{
                if(callbacks['leave']) callbacks['leave'].apply(this);
                delete this['ox'];
                delete this['oy'];
            });
        return true;
    }
    this.translate = function(dx,dy){
        if(!this['element']) return false;
        var position  = {
            cx: parseFloat(this.attr("cx")) + parseFloat(dx),
            cy: parseFloat(this.attr("cx")) + parseFloat(dy)
        };
        if(callbacks['in-box'] && callbacks['in-box'].call(this,position)) this['element'].attr(position);
        return true;
    },
    this.attr = function(attr){
        if(typeof attr == 'string' && this['element']) return this['element'].attr(attr);
        for(var i in attr) {
            if (this.opt[i]) this.opt[i] = attr[i];
            else {
                var index = ["dx","cx","dy","cy"].indexOf(i);
                if(index == 0) attr["cx"] = parseFloat(attr[i]) + parseFloat(this['element'].attr("cx"));
                if(index == 2) attr["cy"] = parseFloat(attr[i]) + parseFloat(this['element'].attr("cy"));
                if(index ==-1) delete attr[i];
            }
        }
        if(this['element']) this['element'].attr(attr);
    }
    this.getBBox = function(){
       if(!this['element']) return null;
       return this['element'].getBBox();
    }
    this.getCenterCoord = function(){
        if(!this['element']) return null;
        var box  = this['element'].getBBox();
        return {
            x: parseFloat(box['cx']),
            y: parseFloat(box['cy'])
        }
    }
    this.compare = function(element){
        if(!element) return false;
        if(element['id'] && this['id'] && (element['id'] == this['id'])) return true;
        var current = this.getCenterCoord();
        if(!current) return false;
        var compairer = null;
        if(element['type']) compairer = element.getBBox();
        else if(typeof element['x'] == 'number' && typeof element['y'] == 'number') compairer = element;
        else return false;
        var radius = (parseFloat(this.opt['radius']) + parseFloat(this.opt['stroke-width'])) * 2;
        return (Math.abs(current['x'] - compairer['x']) <= radius
             && Math.abs(current['y'] - compairer['y']) <= radius);
    }
    this.remove = function(){
        if(!this['element']) return false;
        this['element'].remove();
        // delete this;
        // for(var i in this.near) if(this.near[i]) this.near[i].remove();
        return true;
    }
    return this;
}