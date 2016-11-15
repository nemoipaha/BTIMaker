Math.RADIAN = 57.3;
Math.angleBetweenPoints = function(start,end) {
    return Math.acos(
        Math.abs(start['x'] * end['x'] + start['y'] * end['y']) /
        (Math.sqrt(start['x'] * start['x'] + start['y'] * start['y']) *
        Math.sqrt(end['x'] * end['x'] + end['y'] * end['y']))
    );
}
Math.tangentAngle = function(first,second) {
    return Math.atan((second['y'] - first['y'])/(second['x'] - first['x']));
}
Math.angleByDirection = function(first,second) {
    var dy = second['y'] - first['y'],
        dx = second['x'] - first['x'];
    if(!dx) return Math.PI *((dy < 0 )?  0 : 2);
    return Math.PI * ((dx < 0)? 1: 3) / 2 + Math.atan(dy/dx);
}
Math.vectorPointByCutPoints = function(start,end){
    return {
        x: end['x'] - start['x'],
        y: end['y'] - start['y']
    };
}
Math.getRotateByPoint = function(current,base,angle){
    var temp = angle / Math.RADIAN;//* 0.017;
    temp = {
        sin: Math.sin(temp),
        cos: Math.cos(temp),
        dx: parseFloat(current['x'] - base['x']),
        dy: parseFloat(current['y'] - base['y'])
    };
    return {
        x:  temp['cos'] * temp['dx'] + temp['sin'] * temp['dy'] + base['x'],
        y: - temp['sin'] * temp['dx'] + temp['cos'] * temp['dy']+ base['y']
    }
}
Math.getWallRotate = function(x,y,thickness) {
    var rotate = {
        x: thickness,
        y: 0,
        angle:0
    };
    if(typeof x == 'number' &&  typeof y == 'number' && x) {
        // Если координаты по координатам оси абцисс равны  (dx == 0)
        // то линия отрисовывается как простой прямоугольник
        // В приницпе это условие верно и на ось ординат, но sic (!)
        // При делении dy / dx, делить на нуль вызовет исключение
        rotate['angle'] = Math.atan(y / x);
        var temp = Math.PI / 2 - rotate['angle'];
        rotate['x'] = parseFloat(thickness * Math.cos(temp));
        rotate['y'] = parseFloat(thickness * Math.sin(temp));
        rotate['angle'] *= Math.RADIAN;
    }
    return rotate;
}

Math.wallRect = function(start,end,thickness,change) {
   if (typeof thickness != 'number' || !end  || !start) return null;
    // Делаем проверку на то, чтобы координаты не выходили за пределы контейнера
       if (typeof end['y'] != 'number' || typeof end['x'] != 'number' ||
           typeof start['y'] != 'number' || typeof start['x'] != 'number')return null;

    if (change) {// В некоторых случаях отсутствует необходимость проверки
         if(end['y'] < 0 || end['x'] < 0 || start['y'] < 0 || start['x'] < 0 ||
            this['width'] < end['x'] || this['height'] < end['y'] ||
            this['width'] < end['x'] || this['height'] < end['y']
        )return null;
    }
    var rotate = this.getWallRotate(end['x'] - start['x'],end['y'] - start['y'],thickness),
        rect = [{x: start['x'] + rotate['x'], y: start['y'] - rotate['y']},
            {x: end['x'] + rotate['x'],   y: end['y'] - rotate['y']},
            {x: end['x'] - rotate['x'],   y: end['y'] + rotate['y']},
            {x: start['x'] - rotate['x'], y: start['y'] + rotate['y']}
        ];
    // Делаем проверку на то,чтобы полученные координаты были валидны в пределах контейнера
    if (change)
        for (var i in rect)
            if (rect[i]['x'] < 0 || rect[i]['x'] > this['width']
             || rect[i]['y'] < 0 || rect[i]['y'] > this['height']
            )return null;
    return rect;
}
Math.centerPoint = function (start,end){
    return {
        x: (start['x'] + end['x']) / 2,
        y: (start['y'] + end['y']) / 2
    }
}
Math.increasePoint = function(increasier,temp){
     return {
         x: increasier['x'] + temp['x'],
         y: increasier['y'] + temp['y']
     }
}
Math.inLine  = function(current,start,end){
    console.log(((current['x'] - start['x'])* (end['y'] - start['y'])).toFixed(3));
    console.log(((end['x'] - start['x']) * (current['y'] - start['y'])).toFixed(3));
}
Math.isPointInLine = function(current,start,end){
    var value = ((current['x'] - start['x'])* (end['y'] - start['y'])).toFixed(3) -
                ((end['x'] - start['x']) * (current['y'] - start['y'])).toFixed(3);
    if(!value) return 0; // Принадлежит прямой
    if(value < 0) return -1; // Располагается выше или левее линии
    if(value > 0) return 1; // Рассполагается ниже или правее линии
}
Math.perpendicularPoint = function(current,start,end){
    var A = parseFloat(end['y'] - start['y']),
        B = parseFloat(start['x'] - end['x']),
        C = parseFloat(start['y']*(-B) - start['x']*A),
        temp = parseFloat(- A*A - B*B);
    return {
        x: parseFloat((C*A - B*B*current['x'] + A*B*current['y'])/temp),
        y: parseFloat((C*B - A*A*current['y'] + A*B*current['x'])/temp)
    }
}
Math.lineWidth = function(start,end){
     return Math.sqrt( (start['x'] - end['x'])* (start['x'] - end['x']) + (start['y'] - end['y'])*(start['y'] - end['y']));
}
Math.nearPointByPointsPair  = function(current,start,end,mode){
    var lines = {
        start:Math.lineWidth(current,start),
        end:Math.lineWidth(current,end)
    }
    return ((mode) ? Math.min(lines['start'],lines['end']):(lines['start'] > lines['end']));
}
Math.positionByPointsPair = function(current,start,end){
   return [
       ((Math.isPointInLine(current,start,end) == - 1) ? 'bottom':'top'),
       (Math.nearPointByPointsPair(current,start,end) ? 'right':'left')
   ];
}
Math.isPointInPolygon = function(point,array){
   var parity = false,callback = function(u,v){
       switch(Math.isPointInLine(point,array[u],array[v])){
           case 0: // Точка лежит на границе многоугольника
               return true;
               break;
           case 1: //left
               if(((array[u]['y'] < point['y'])&&(point['y'] <= array[v]['y']))) parity = !parity;
               break;
           case -1: //right
               if((array[v]['y'] < point['y'])&&(point['y'] <= array[u]['y'])) parity = !parity;
               break;
       }
       return false;
   }
    for (var i = 0; i < array.length - 1;i++) if(callback(i,i+1)) return -1;
    if(callback(array.length - 1,0)) return -1;

    return parity;
}
Math.pointByPropDist = function(start,end,width){
    var l =  parseFloat(Math.lineWidth(start,end)/width);
    return {
        x: parseFloat((start['x'] + l * end['x'])/(1 + l)),
        y: parseFloat((start['y'] + l * end['y'])/(1 + l))
    }
}
Math.pointByPairForDistance = function(start,end,width/*,mode*/){
    var t = width / Math.lineWidth(start,end);
    //if(mode) t = 1 - l;
    return {
        x:start['x'] + t *(end['x'] - start['x']),
        y:start['y'] + t *(end['y'] - start['y'])
    }
}
Math.equalPoint = function(first,second){
    return ((first['x'] == second['x']) && (first['y'] == second['y']));
}

Math.canonicalEquation = function(a,b){
    var cf = {
        A: b.y - a.y,
        B: a.x - b.x
    };
    cf['C']  = a.y * (b.x - a.x) - a.x * cf['A'];
    return cf;
}
Math.crossPoint = function(a,b,c,d) { //точки a и b концы первого отрезка  c и d второго
    if (Math.equalPoint(a, c) || Math.equalPoint(b, c)) return c;
    if (Math.equalPoint(a, d) || Math.equalPoint(b, d)) return d;
    var temp = {
        first:Math.canonicalEquation(a,b),
        second:Math.canonicalEquation(c,d)
    },roots = {
        d: temp['first']['A'] * temp['second']['B'] - temp['second']['A'] * temp['first']['B'],
        x: - temp['first']['C'] * temp['second']['B'] + temp['second']['C'] * temp['first']['B'],
        y: - temp['first']['A'] * temp['second']['C'] + temp['second']['A'] * temp['first']['C']
    };
    if(!roots['d']) return null;
    roots['x'] /= roots['d'];
    roots['y'] /= roots['d'];
    delete roots['d'];
    return roots;
}
Math.crossCutsPoint = function(a,b,c,d){
    var array = [
        ((a.x < b.x) ? a : b),
        ((a.x < b.x) ? b : a),
        ((c.x < d.x) ? c : d),
        ((c.x < d.x) ? d : c)
    ];
    if(((array[0].y == array[1].y) ? 0 : ((array[1].y - array[0].y) / (array[1].x - array[0].x))) ==
        ((array[3].y == array[2].y) ? 0 : ((array[3].y - array[2].y) / (array[3].x - array[2].x)))) return false;
     var point = Math.crossPoint(array[0],array[1],array[2],array[3]);
    if(!point) return false;
    var range = {
            x: ((array[0].x < point.x) && (array[1].x > point.x) && (array[2].x < point.x) && (array[3].x > point.x))
    };
    array = [
        ((a.y < b.y) ? a : b),
        ((a.y < b.y) ? b : a),
        ((c.y < d.y) ? c : d),
        ((c.y < d.y) ? d : c)
    ];
    range['y'] = ((array[0].y < point.y) && (array[1].y > point.y) && (array[2].y < point.y) && (array[3].y > point.y));
    if( range['y'] &&  range['x']) return point;
    return false;
}