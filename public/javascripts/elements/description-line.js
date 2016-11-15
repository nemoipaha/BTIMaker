BTIAppController['type-manager'].types['description-line'].create = function() {
    var paper = BTIAppController['papers'].currentContext();
    if (!paper) return null;
    var element = new descriptionLine(Object.assign({},this['opt']),this['callbacks']);
    if(element){
        element.recreate(paper);
        element.hide();
    }
    return element;
}
BTIAppController['type-manager'].types['description-line'].callbacks = {
    changeText: function(value){
        if(typeof BTIAppController['callbacks'].scale == 'function')
            value *= BTIAppController['callbacks'].scale(this['paper']);
        return value.toFixed(2).toString();
    }
}
function descriptionLine(opt,callbacks){
     this.type = 'description-line';
     this.opt = opt;
     this.recreate = function(paper){
         if(!paper) return;
         this.remove();
         this.element = paper.set([
             paper.path().attr(this.opt['main']),
             paper.path().attr(this.opt['sub']),
             paper.path().attr(this.opt['sub']),
             paper.text().attr(this.opt['text'])
         ]);
     }
     this.redraw = function(opt) {
         if (!this['element']) return;
         var lines = {
             sub: {
                 start: { start: opt['start'] },
                 end: { start: opt['end']}
             }
         };
         if (!opt['heights']) opt['heights'] = {};
         if (!opt['thickness']) opt['thickness'] = this.opt['thickness'];
         if (opt['heights']['sub'] == null) opt['heights']['sub'] = parseFloat(this.opt['sub']['height']);
         if (opt['heights']['main'] == null) opt['heights']['main'] = parseFloat(this.opt['main']['height']);
         if (opt['heights']['sub'] < 0) opt['heights']['sub'] = 0;
         if (opt['heights']['main'] < 0) opt['heights']['main'] = 0;
         if (opt['heights']['sub'] > 1) opt['heights']['sub'] = 1;
         if (opt['heights']['main'] > 1) opt['heights']['main'] = 1;
         if (opt['heights']['main'] > opt['heights']['sub']) opt['heights']['main'] = opt['heights']['sub'];
         var size = this['element'][3].attr("font-size"),
             rects = {
                 main: Math.wallRect(opt['start'], opt['end'],
                    parseFloat(opt['thickness']) * opt['heights']['main']
                 ), sub: Math.wallRect(opt['start'], opt['end'],
                    parseFloat(opt['thickness']) * opt['heights']['sub']
                 ), text: Math.wallRect(opt['start'], opt['end'],
                    parseFloat(opt['thickness']) * opt['heights']['main'] + size * 2 / 3
                 )
             },pair = [0,1];
         if (!opt['direction'])pair = [3,2];
         var position = Math.centerPoint(
             rects['text'][pair[0]],
             rects['text'][pair[1]]
         );
         lines['main'] = {
            start: rects['main'][pair[0]],
            end: rects['main'][pair[1]]
         };
         lines['sub']['start']['end'] = rects['sub'][pair[0]];
         lines['sub']['end']['end'] = rects['sub'][pair[1]];
         lines['text'] = Math.lineWidth(
            lines['main']['start'],
            lines['main']['end']
         ).toFixed(3);
         if(lines['text'] == 0) this.hide(); // Потому что это падло  типа double не действует приведение с типом false (!valuе)
         else this.show();
         if(lines['text'] < this['element'][3].getBBox().width) this['element'][3].hide();
         else this['element'][3].show();
         this['element'][0].attr({
             path: [
                 "M", lines['main']['start']['x'],
                      lines['main']['start']['y'],
                 "L", lines['main']['end']['x'],
                      lines['main']['end']['y']
             ]
         });
         this['element'][1].attr({
             path: [
                 "M", lines['sub']['start']['start']['x'],
                      lines['sub']['start']['start']['y'],
                 "L", lines['sub']['start']['end']['x'],
                      lines['sub']['start']['end']['y']
             ]
         });
         this['element'][2].attr({
             path: [
                 "M", lines['sub']['end']['start']['x'],
                     lines['sub']['end']['start']['y'],
                 "L", lines['sub']['end']['end']['x'],
                    lines['sub']['end']['end']['y']
             ]
         });

         lines['angle'] = Math.PI/2 - Math.angleByDirection(
             lines['main']['end'],
             lines['main']['start']
         );
         if(( lines['main']['end']['x'] - lines['main']['start']['x']) < 0) lines['angle'] += Math.PI;
         lines['angle'] *= - Math.RADIAN;
         this['element'][3].rotate(-this['element'][3]['matrix'].split()['rotate']).attr({
            x: position['x'],
            y: position['y'],
            text: callbacks['changeText'].call(this,lines['text'])
         }).rotate(lines['angle']);
     }
    this.remove = function(){
        if(this['element'])
            for (var i in this['element'].items)
                this['element'].items[i].remove();
        return this;
    }
    this.toFront = function(){
        if(this['element'])
            for (var i in this['element'].items)
                this['element'].items[i].toFront();
        return this;
    }
    this.show = function(){
        if(this['element'])
            for (var i in this['element'].items)
                this['element'].items[i].show().toFront();
        return this;
    }
    this.hide = function(){
        if(this['element'])
            for (var i in this['element'].items)
                this['element'].items[i].hide();
        return this;
    }
    return this;
}