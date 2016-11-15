BTIAppController['type-manager'].types['service-button'].create = function(opt) {
    var paper = BTIAppController['papers'].currentContext();
    if(!paper) return null;
    opt['image'] = this['opt']['type-images'][opt['image']];
    if (!opt['image']) return null;
    opt = Object.assign(opt,this['opt']);
    opt['draggable'] = false;
    delete opt['type-images'];
    var box = new serviceButton(opt);
    if(box){
        box.recreate(paper);
        box.hide();
    }
    return box;
}
function serviceButton(opt){
    this.opt = opt;
    this.recreate  = function(paper) {
        this.remove();
        this.element = paper.set([
            paper.circle(0, 0, this.opt['radius']).attr(this.opt),
            paper.image(this.opt['image'], 0, 0,this.opt['radius'],this.opt['radius'])
        ]).dblclick((e)=>{
           if (this.callbacks['dblclick']) this.callbacks['dblclick'](e);
        }).drag((dx, dy)=> {
                var position = {
                    x: parseFloat(this.element['ox']) + parseFloat(dx),
                    y: parseFloat(this.element['oy']) + parseFloat(dy)
                };
                if (this.opt['draggable']) this.setPosition(position['x'], position['y']);
                if (this.callbacks['move']) this.callbacks['move'](position);
            }, ()=> {
                this.element['ox'] = parseFloat(this.element['items'][0].attr("cx"));
                this.element['oy'] = parseFloat(this.element['items'][0].attr("cy"));
            }, ()=> {
                if (this.callbacks['mouse-up']) this.callbacks['mouse-up']();
                delete this.element['ox'];
                delete this.element['oy'];
            }
        );
        this.hide();
    }
    this.callbacks = function(callbacks){
        for(var i in callbacks)
            if(typeof callbacks[i] == 'function')
                this.callbacks[i] = callbacks[i];
    }
    this.hide = function(){
        if(this['element']) {
            var items = this.element['items'];
            for (var i in items) items[i].hide();
        }
        return this;
    }
    this.toFront = function(){
        if(this['element']) {
            var items = this.element['items'];
            for (var i in items) items[i].toFront();
        }
        return this;
    }
    this.show = function(){
        if(this['element']) {
            var items = this.element['items'];
            for (var i in items) items[i].show().toFront();
        }
        return this;
    }
    this.remove = function(){
        if(!this['element']) return false;
        this['element'].remove();
        // delete this;
        return true;
    }
    this.setPosition = function(x,y){
        if(!this['element']) return false;
        var items = this.element['items'];
        items[0].attr({ cx: x, cy: y });
        items[1].attr({
            x: parseFloat(x) - parseFloat(this.opt['radius'])/2,
            y: parseFloat(y) - parseFloat(this.opt['radius'])/2
        });
        return this;
    }
    this.getPosition = function(){
        if(!this['element']) return null;
        var items = this.element['items'];
        return {
            x: parseFloat(items[0].attr("cx")),
            y: parseFloat(items[0].attr("cy"))
        }
    }
    this.setOption = function(key,value){
        if(Object.keys(this.opt).indexOf(key) == -1) return false;
        this.opt[key] = value;
        return true;
    }
    return this;
}
