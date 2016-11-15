BTIAppController['type-manager'].types['service-wall'].create = function(){
    var paper = BTIAppController['papers'].currentContext();// Получаем текущий контекст рисования
    if(!paper) return null;// И проверяем его на валидность
    var opt  = BTIAppController['type-manager'].types['point'].opt;
    if(!opt) return null;
    var element = new wallBuildBox(Object.assign({
        radius: parseFloat(opt['radius']) + parseFloat(opt['stroke-width'])
    }, this['opt']),this['callbacks']);
    if(element) element.recreate(paper);
    return element;
}
BTIAppController['type-manager'].types['service-wall'].callbacks ={
    wallPath: function(start,end) {
        var rect = Math.wallRect(start,end, parseFloat(BTIAppController['type-manager'].types['point'].opt['radius']));
        return [
            "M",rect[1].x, rect[1].y,
            "L",rect[0].x, rect[0].y,
            "L",rect[3].x, rect[3].y,
            "L",rect[2].x, rect[2].y,
        ];
    },
    isCrossed: function(position){
        // Решение не оптимальное ТОЛЬКО ДЛЯ ПРЯМЫХ
        var walls = BTIAppController['papers'].getObjectsByType('wall',this['paper']),
            old = {
                x: parseFloat(this['element'][1].attr("cx")),
                y: parseFloat(this['element'][1].attr("cy"))
            };
        for (var i in walls)
            if(Math.crossCutsPoint(old,position,
                walls[i].points['start'].getCenterCoord(),
                walls[i].points['end'].getCenterCoord())
            ) return false;
        return true;
    }
}
function wallBuildBox(opt,callbacks){
  this.opt = opt;
  this.type = 'service-wall';
  this.recreate = function(paper) {
      this.element = paper.set([
          paper.path(),
          paper.circle(-10, -10, opt['radius']).attr(this.opt['circle']),
          paper.path().attr(this.opt['circle'])
      ]);
  }
  this.remove = function(){
      if(!this['element'])  return false;
      this['element'].remove();
      // delete this;
      return true;
  }
  this.setStartPoint = function(position){
      if(!this['element']) return false;
      this.show();
      this['element'][1].attr({
          cx: parseFloat(position['x']),
          cy: parseFloat(position['y'])
      });
      this['element'][0].attr({ path:null });
      return true;
  }
  this.setEndPoint = function(position) {
      if(typeof position == 'undefined' || !this['element']) return false;
      var start = {
          x: parseFloat(this['element'][1].attr("cx")),
          y: parseFloat(this['element'][1].attr("cy"))
      },stroke = ((callbacks['isCrossed'].call(this,position))?
          opt['wall']['stroke']: opt['wall']['stroke-hover']
      ),wall = callbacks.wallPath(start,position);
      this['element'][0].attr({
          path: callbacks.wallPath(start,position),
          stroke: stroke
      });
      position = Math.pointByPairForDistance(start,position,
          Math.lineWidth(start,position) + parseFloat(this.opt['radius'])
      );
      this['element'][2].attr({
          path:[
              'M',wall[1],wall[2],
              'Q',position['x'],position['y'],
                  wall[10],wall[11]
          ], stroke: stroke
      });
      return true;
  }
  this.hide = function(){
      var array = this['element'].items;
      for(var i in array) array[i].hide();
      this['element'][0].attr({ stroke: opt['wall']['stroke'] });
      return this;
  }
  this.show = function(){
      var array = this['element'].items;
      for(var i in array) array[i].show().toFront();
      return this;
  }
  return this;
}