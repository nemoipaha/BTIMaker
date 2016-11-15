BTIAppController['type-manager'].types['sliding-door'].create = function(){
    if(!BTIAppController['papers'].currentContext()) return null;
    return (new slidingDoor(Object.assign({},this['opt']), this['callbacks']));
}
BTIAppController['type-manager'].types['sliding-door'].createFromDB = function(data){
    var paper = BTIAppController['papers'].currentContext();// Если отсутствует контекст возвращаем null в качестве объекта
    if(!paper) return null;
    var opt = Object.assign({},this['opt']);
    delete opt['categoryId'];
    delete opt['icon'];
    delete opt['min-width'];
    delete opt['width'];
    var object = new slidingDoor(opt,this['callbacks']);
    if(object){
        var wall = BTIAppController['papers'].getElementById(data.opt['wall']);
        data['opt'].points = data['points'];
        delete data['wall'];
        object.recreate(paper,data['opt'],wall);
    };
    return object;
}
BTIAppController['type-manager'].types['sliding-door'].callbacks = {
    invalidate:function(){
        if(this['type'] != 'sliding-door' || !this['sub-boxes'] || !this['element']) return;
        var points = [],items, angle = 50,center = this.getCenterPosition(),
            width = parseFloat(this['sub-boxes'].buttons['edit-box'].opt['radius']) +
                    parseFloat(this['sub-boxes'].buttons['edit-box'].opt['stroke-width']) +
                    parseFloat(BTIAppController['type-manager'].types['service-button'].opt['radius']);

        for(var i = 0; i < 4; i++) points.push({
            start:this['wall'].pointByRectIndex(i + ((i > 1)? 2 : 1)),
            end:this.getPointByIndex(i)
        });
        points.push( // Получаем пары точек для отрисовки кнопок масштабирования двери
            points[3]['end'], points[2]['end'],
            Math.getRotateByPoint(
                Math.pointByPairForDistance(center, points[3]['end'],width),
                center, -angle * 2),
            Math.getRotateByPoint(
                Math.pointByPairForDistance(
                    center,points[3]['end'],
                    width +  parseFloat(this['sub-boxes'].buttons['translate-start-box'].opt['radius']) +
                             parseFloat(this['sub-boxes'].buttons['translate-start-box'].opt['stroke-width'])
                ),center, angle),
            Math.getRotateByPoint(
                Math.pointByPairForDistance(
                    center,points[2]['end'],
                    width +  parseFloat(this['sub-boxes'].buttons['translate-end-box'].opt['radius']) +
                             parseFloat(this['sub-boxes'].buttons['translate-end-box'].opt['stroke-width'])
                ),center, -angle)
        );
        var start = points[2]['end'], end = points[3]['end'];
        if(Math.isPointInLine(
                points[0]['end'],
                points[0]['start'],
                points[1]['start']
            )) for(var i = 0 ; i < 2;i++) {
            var temp = points[i]['end'];
            points[i]['end'] = points[i + 2]['end'];
            points[i + 2]['end'] = temp;
        }
        for(var i = 0; i < 4;i += 2)
            if(Math.nearPointByPointsPair(
                    points[i + 1]['start'],
                    points[i + 1]['end'],
                    points[i]['end']
                )){
                var temp = points[i]['end'];
                points[i]['end'] = points[i + 1]['end'];
                points[i + 1]['end'] = temp;
            }
        if((items = this['sub-boxes'].lines)) {
            var keys = Object.keys(items);
            for (var i in items) {
                var index = keys.indexOf(i);
                items[i].redraw({
                    start: points[index]['start'],
                    end: points[index]['end'],
                    direction: ((index < 2) ? true: false)
                });
            }
        }
        if((items = this['sub-boxes'].buttons)) {
            keys = Object.keys(items);
            for (var i in items) {
                index = keys.indexOf(i) + 4;
                items[i].setPosition(
                    points[index].x,
                    points[index].y
                ).toFront();
            }
        }
    },
    click:function(flag) {
        if(this['type'] != 'sliding-door' || !this['element']) return;
        var door = this;
        if(!door['sub-boxes']) door['sub-boxes'] = {
            buttons: {
                'translate-start-box': null,
                'translate-end-box': null,
                'edit-box': null,
                'remove-box':null,
                'hide-box':null
            },
            lines:{
                'left-top-line':null,
                'right-top-line':null,
                'right-bottom-line':null,
                'left-bottom-line':null
            }
        };
        for (var i in door['sub-boxes'].buttons) {
            if (!door['sub-boxes'].buttons[i]) door['sub-boxes'].buttons[i] =
                BTIAppController['papers'].getElementById(i,true,door['paper']);
            if (!door['sub-boxes'].buttons[i]) door['sub-boxes'].buttons[i] =
                BTIAppController['papers'].createElement('service-button',{image: i},i,true,door['paper']);
            if (!door['sub-boxes'].buttons[i]) return;
        }
        for(var i in door['sub-boxes'].lines){
            if (!door['sub-boxes'].lines[i]) door['sub-boxes'].lines[i] =
                BTIAppController['papers'].getElementById(i,true,door['paper']);
            if (!door['sub-boxes'].lines[i]) door['sub-boxes'].lines[i] =
                BTIAppController['papers'].createElement('description-line',i,true,door['paper']);
            if (!door['sub-boxes'].lines[i]) return;
        }
        door.select(flag);
        var invalidate = BTIAppController['type-manager'].types['sliding-door'].callbacks['invalidate'].bind(door),
            element = BTIAppController['papers'].currentElement('door',door['paper']);
        if(element) {
            if (element['id'] == door['id']){
                if(flag){
                    invalidate();
                    return;
                }
                for (var i in door['sub-boxes'].buttons) door['sub-boxes'].buttons[i].hide();
                for (var i in door['sub-boxes'].lines)   door['sub-boxes'].lines[i].hide();
            }
            if(flag) BTIAppController['type-manager'].types[element['type']].callbacks['click'].call(element,false);
        }
        if(!flag) {
            BTIAppController['papers'].setCurrentElement('door',null,door['paper']);
            delete door['sub-boxes'];
            return;
        }
        BTIAppController['papers'].setCurrentElement('door',door,door['paper']);
        element = BTIAppController['papers'].currentElement('wall',door['paper']);
        if(element) BTIAppController['type-manager'].types['wall'].callbacks['click'].call(element,false);
        var translate = function(point,mode){
                var points = door.getFoundationPoints();
                if((Math.positionByPointsPair(point, points['start'],points['end'])[1] != mode)) return;
                var center = Math.centerPoint(
                    points['start'],
                    points['end']
                ), width = Math.lineWidth(center,
                    Math.perpendicularPoint(
                        point,points['start'],
                        points['end']
                    )
                );
                if(door['wall']) {
                    points = BTIAppController['type-manager'].types['wall'].callbacks['valid-point'].apply(door['wall'],[{
                        type: 'sliding-door',
                        current:center,
                        width:{main : width}
                    },door]);
                    if(!points)  return;
                    door.redraw({
                        points:points,
                        thickness:door.opt['thickness']
                    });
                    if(typeof BTIAppController['callbacks']['update'] == 'function') BTIAppController['callbacks'].update();
                }
                invalidate();
            };

        door['sub-boxes'].buttons['translate-start-box'].callbacks({ move: (point)=>{ translate(point,'left'); } });
        door['sub-boxes'].buttons['translate-end-box'].callbacks({ move: (point)=>{ translate(point,'right'); }});
        door['sub-boxes'].buttons['edit-box'].callbacks({
            dblclick:()=>{
                if(typeof BTIAppController['callbacks']['edit'] == 'function')
                    BTIAppController['callbacks'].edit(door);
            }
        });
        door['sub-boxes'].buttons['hide-box'].callbacks({
            dblclick:()=>{
                BTIAppController['type-manager'].types['sliding-door'].callbacks['click'].call(this,false);
                if(typeof BTIAppController['callbacks']['hide'] == 'function') BTIAppController['callbacks'].hide();
            }
        });
        door['sub-boxes'].buttons['remove-box'].callbacks({
            dblclick:()=>{
                if(typeof BTIAppController['callbacks']['remove'] == 'function') BTIAppController['callbacks'].remove();
                BTIAppController['type-manager'].types['sliding-door'].callbacks['remove'].apply(door);
            }
        });
        for (var i in door['sub-boxes'].buttons) door['sub-boxes'].buttons[i].show().toFront();
        for (var i in door['sub-boxes'].lines)   door['sub-boxes'].lines[i].show().toFront();
        invalidate();
    },
    remove: function(){
        if(this['type'] != 'sliding-door') return;
        BTIAppController['type-manager'].types['sliding-door'].callbacks['click'].call(this,false);
        if(this['wall']) {
            var index = this['wall']['holes'].findIndex((e)=> { return this.equal(e);});
            if (index != -1) this['wall']['holes'].splice(index,1);
        }
        BTIAppController['papers'].removeElement(this['id'],this['paper'],this['paper']);
    },
    down: function(){
        if(!this['element'] || this['type'] != 'sliding-door' || !this['wall']) return;
        this['no-crossing'] = this.getFoundationPoints();
    },
    move:function(point){
        if(!this['element'] || this['type'] != 'sliding-door' || !this['wall']) return;
        var current = BTIAppController['papers'].currentElement('door',this['paper']);
        if(!current) return;
        if(!this.equal(current)) return;
        var points = this.getFoundationPoints();
        point = Math.perpendicularPoint(point, points['start'], points['end']);
        points = BTIAppController['type-manager'].types['wall'].callbacks['valid-point'].apply(this['wall'],[{
           'translate-mode':true,
            type: 'sliding-door',
            current:point,
            width:{ main:this.getHalfWidth() }
        },this]);
        if(!points) return;
        this.redraw({ points:points });
        if(!points['crossing']) this['no-crossing'] = points;
        BTIAppController['type-manager'].types[this['type']].callbacks['invalidate'].apply(this);
    },
    leave: function(){
        if(!this['element'] || this['type'] != 'sliding-door' || !this['wall']) return;
        var current = BTIAppController['papers'].currentElement('door',this['paper']);
        if(!current) return;
        if(!this.equal(current)) return;
        if(this['no-crossing']){
            this.redraw({ points:this['no-crossing'] });
            BTIAppController['type-manager'].types[this['type']].callbacks['invalidate'].apply(this);
            delete this['no-crossing'];
        }
    },
    'parent-changed': function(parent){
        if(this['type'] != 'sliding-door') return  false;
        if(parent['holes'].findIndex((e)=>{ return this.equal(e); }) != -1) return false;
        parent['holes'].push(this);
        return true;
    }
}
function slidingDoor(opt,callbacks){
    this.opt = opt;
    this.type = 'sliding-door';
    this.equal = function(object){
        if(!object) return false;
        return (this['id'] == object['id'] && this['type'] == object['type']);
    }
    this.recreate = function(paper,opt,parent){
        this.remove();
        this.element = paper.set([
            paper.path().attr(this.opt["main-rect"]).hover(()=> {
                this.element[1].attr({ fill: this.opt["door-connection"]["hover-fill"] });
                this.element[2].attr({ fill: this.opt["door-connection"]["hover-fill"] });
            }, ()=> {
                this.element[1].attr({ fill: this.opt["door-connection"]["fill"] });
                this.element[2].attr({ fill: this.opt["door-connection"]["fill"] });
            }).dblclick(()=> {
                var flag = !(this['element'][0].attr('fill') == this.opt['main-rect']['selected-fill']);
                if(typeof callbacks['click'] == "function") callbacks['click'].call(this, flag);
                else this.select(flag);
            }).drag((dx,dy)=>{
                if(typeof callbacks['move'] == "function")
                    callbacks['move'].apply(this,[{
                        x: parseFloat(dx) + parseFloat(this['old-drag'].x),
                        y: parseFloat(dy) + parseFloat(this['old-drag'].y)
                    }]);
                else {
                    this['element'].translate(["M", dx, dy]);
                    if(typeof callbacks['invalidate'] == "function") callbacks['invalidate'].apply(this);
                }
            },()=>{
                var box = this.element['items'][0].getBBox();
                this['old-drag'] = {
                    x: parseFloat(box["cx"]),
                    y: parseFloat(box["cy"])
                };
                if(typeof callbacks['down'] == "function") callbacks['down'].apply(this);
            },()=>{
                delete this['old-drag'];
                if(typeof callbacks['leave'] == "function") callbacks['leave'].apply(this);
            }),
            paper.path().attr(this.opt["door-connection"]),
            paper.path().attr(this.opt["door-connection"]),
            paper.path().attr(this.opt["door-line"]),
            paper.path().attr(this.opt["door-line"])
        ]);
        this.redraw(opt,parent);
    }
    this.redraw = function(opt,parent){
        this.setParentWall(parent);
        if(!this['element']) return;
        if(opt['thickness']) this.opt['thickness'] = opt['thickness'];
        var rects = {
            left:null,
            right:null,
            main: Math.wallRect(
                opt.points['start'],
                opt.points['end'],
                parseFloat(this.opt["door-connection"]['height'])
            )
        }, center = Math.centerPoint(opt.points['start'], opt.points['end']),
           temp = parseFloat(this.opt["door-connection"]['width']);

        rects['left'] = JSON.parse( JSON.stringify(rects['main'] ));
        rects['right'] = JSON.parse( JSON.stringify(rects['main'] ));
        rects['left'][1] = Math.pointByPairForDistance(
            rects['main'][0],
            rects['main'][1],
            temp
        );
        rects['left'][2] = Math.pointByPairForDistance(
            rects['main'][3],
            rects['main'][2],
            temp
        );
        rects['right'][0] = Math.pointByPairForDistance(
            rects['main'][1],
            rects['main'][0],
            temp
        );
        rects['right'][3] = Math.pointByPairForDistance(
            rects['main'][2],
            rects['main'][3],
            temp
        );
        rects['main'] = Math.wallRect(
            opt.points['start'],
            opt.points['end'],
            parseFloat(this.opt['thickness']
        ));
        temp = Math.centerPoint(rects['left'][1], rects['left'][2]);
        this.element[3].attr({
            path: [
                "M", temp['x'],temp['y'],
                "L",center['x'],center['y']
            ]
        });
        temp = Math.centerPoint(rects['right'][0], rects['right'][3]);
        this.element[4].attr({
            path: [
                "M", temp['x'],temp['y'],
                "L",center['x'],center['y']
            ]
        });
        for(var i in rects) rects[i] = BTIBaseObject.wallPath(rects[i]);
        this.element[0].attr({path: rects['main']});
        this.element[1].attr({path: rects['left']});
        this.element[2].attr({path: rects['right']});
        if(typeof callbacks['invalidate'] == "function") callbacks['invalidate'].apply(this);
        return true;
    }
    this.setParentWall = function(parent){
        if(!parent || parent['type']!= 'wall') return false;
        this.wall = parent;
        if(typeof callbacks['parent-changed'] == "function") callbacks['parent-changed'].call(this,parent);
        return true;
    }
    this.getBBox = function(){
        if(!this['element']) return null;
        return this['element'][0].getBBox();
    }
    this.getCenterPosition = function(){
        var box = this.getBBox();
        if(!box) return null;
        return {
            x: parseFloat(box['cx']),
            y: parseFloat(box['cy'])
        }
    }
    this.toFront = function(){
        if(!this['element']) return false;
        var items = this['element'].items;
        for(var i in items)  items[i].toFront();
        if(typeof callbacks['invalidate'] == "function") callbacks['invalidate'].apply(this);
        return true;
    }
    this.getPointByIndex = function(index){
        if(!this['element'] || index < 0 ||index > 3) return null;
        var path = this['element'][0].attr("path");
        if(!path) return null;
        return {
            x: parseFloat(path[index][1]),
            y: parseFloat(path[index][2])
        }
    }
    this.getWidth = function(){
        if(!this['element']) return null;
        var points = this.getFoundationPoints();
        return Math.lineWidth(points['start'],points['end'])
    }
    this.getHalfWidth = function(){
        var width = this.getWidth();
        return (width ? width/2 : null);
    }
    this.getFoundationPoints = function() {
        if(!this['element']) return null;
        var path = this['element'][0].attr("path");
        if(path.length < 3) return null;
        return {
            start: Math.centerPoint({
                x: parseFloat(path[0][1]),
                y: parseFloat(path[0][2])
            },{
                x: parseFloat(path[3][1]),
                y: parseFloat(path[3][2])
            }), end: Math.centerPoint({
                x: parseFloat(path[1][1]),
                y: parseFloat(path[1][2])
            },{
                x: parseFloat(path[2][1]),
                y: parseFloat(path[2][2])
            })
        }
    }
    this.remove = function(){
        if(!this['element']) return false;
        this['element'].remove();
        return true;
    }
    this.select = function(flag){
        if(!this['element']) return;
        this['element'][0].attr({
            fill: this.opt['main-rect'][(
                flag ? 'selected-fill' : 'fill'
            )]
        });
    };
    this.getMaxWidth = function () {
        if (!this.wall) return null;
        var points = this['wall'].getArrayOfFoundationPoints(),
            center = this['wall'].centerInModifitedPoints();
        // 0(center) - 1 -2(curved) - 3 -4(center) -5 - 6(curved) - 7
        points[1] = Math.perpendicularPoint(points[1], points[0], points[4]);// left - top
        points[3] = Math.perpendicularPoint(points[3], points[0], points[4]);// right- top
        points[5] = Math.perpendicularPoint(points[5], points[0], points[4]);// right-bottom
        points[7] = Math.perpendicularPoint(points[7], points[0], points[4]);// left - bottom
        points = [
            Math.perpendicularPoint((Math.nearPointByPointsPair(
                center, points[1], points[7]) ? points[7] : points[1]), points[0], points[4]),
            Math.perpendicularPoint((Math.nearPointByPointsPair(
                center, points[3], points[5]) ? points[5] : points[3]), points[0], points[4]),
        ];
        if (!this.wall['holes'].length) return Math.lineWidth(points[0], points[1]);
        else {
            for (var i in this.wall['holes']) {
                if (this.id == this.wall['holes'][i].id) continue;
                var positions = this.wall['holes'][i].getFoundationPoints();
                points.push(positions['start'], positions['end']);
            }
            var end = points[1], current = this.getCenterPosition();
            points.push(center);
            points.sort((a, b)=> {
                return (Math.nearPointByPointsPair(end, a, b) ? 1 : -1);
            });

            var index = points.findIndex(function (point) {
                return (point['x'] == center['x'] && point['y'] == center['y']);
            });
            if (index == -1) return null;
            return Math.lineWidth(points[index - 1], points[index + 1]);
        }
    }
    this.attr = function (object) {
        if (typeof object == 'string') {
            switch (object) {
                case 'width':
                    return this.getWidth();
                case 'max-width':
                    return this.getMaxWidth();
                default:
                    return null;
            }
        } else {

        }
    }
    this.compaire = function(object){
        if(!this['element'] || (typeof object['getFoundationPoints'] != "function")) return false;
        var current = this.getFoundationPoints(),compairer = object.getFoundationPoints();
        return ((Math.equalPoint(current['start'],compairer['start'])
              && Math.equalPoint(current['end'],compairer['end']))
              ||(Math.equalPoint(current['end'],compairer['start'])
              && Math.equalPoint(current['start'],compairer['end'])));
    }
    return this;
}