import React from 'react';
//import Draggable from 'react-draggable';

var ArrowMenu = React.createClass({
  getInitialState: function () {
    return {
      rotateAngle: 0,
      externalRadius: 0,
      internalRadius: 0,
      isResizableByRadius: false,
      standartColors: {
        active: null,
        main: null,
        hover: null
      },
      standartLineWidth: 1,
      standartIconOpacity: 0.3,
    }
  },

  _polarToCasterian: function (cx, cy, radius, angle) {
    angle = (angle - 90) * Math.PI / 180;
    return {
      x: Math.ceil(cx + radius * Math.cos(angle)),
      y: Math.ceil(cy + radius * Math.sin(angle))
    }
  },
  _describeArc: function (cx, cy, radius, startAngle, endAngle, isInner) {
    var start = this._polarToCasterian(cx, cy, radius, startAngle % 360);
    var end = this._polarToCasterian(cx, cy, radius, endAngle % 360);

    return ['M', start.x, start.y, 'A', radius, radius, 0, Number(Math.abs(startAngle - endAngle) >= 180), isInner, end.x, end.y];
  },

  _describleItem: function (cx, cy, externalRadius, internalRadius, startAngle, endAngle) {
    var mainArc = this._describeArc(cx, cy, externalRadius, endAngle, startAngle, 0),
      subArc = this._describeArc(cx, cy, internalRadius, startAngle, endAngle, 1);
    mainArc[0] = 'L';

    return subArc.concat(mainArc, ['L', subArc[1], subArc[2]]);
  },

  componentDidMount: function () {
    var options = this.props.opt;

    if (!(options.iconButtonArray instanceof Array || options.iconButtonArray.length < 2 ) ||
      options.iconButtonArray === null) return ;

    // наш компонент в целом
    var arrowComponentsArray = [];

    var paper = Raphael(this.refs.arrowMenu),
      rect = this.refs.arrowMenu.getBoundingClientRect(),

      lw = parseInt((options.lineWidth == null || options.lineWidth < 1) ? options.standartLineWidth : options.lineWidth),

    // внешний радиус
      radius = (parseInt(rect.width > rect.height ? rect.height : rect.width)) / 2,

    // внутр радиус
      innerRadius = radius / 3,

      dev = parseInt((parseInt(options.angleDeviation) == null ) ? 0 : options.angleDeviation),

      angle = parseInt(360 / options.iconButtonArray.length);

    for (var i in options.iconButtonArray) {
      var cx = rect.width / 2, cy = rect.height / 2,
        group = [paper.path(this._describleItem(cx, cy, radius, innerRadius,
          dev + parseInt(i) * angle, dev + (parseInt(i) + 1) * angle)).hover(
          function () {
            paper.getById(this.id).attr({ fill: options.styles.path.hover_color_in });
          },
          function () {
            paper.getById(this.id).attr({ fill: options.styles.path.hover_color_out });
          }
        ).attr({
          fill: options.styles.path.fill,
          stroke: options.styles.path.stroke
        })],
        box = group[0].getBBox(),
        ipath = options.iconButtonArray[i].icon;

      if (typeof ipath == 'string') {
        var type = ipath.substr(ipath.lastIndexOf('.') + 1);
        if (options.typeImageArray.indexOf(type) != -1) {
          var iconSize = parseInt(((box.width > box.height) ? box.width : box.height) / 2),
            startRotationIconAngle = (options.iconButtonArray[i].startRotationIconAngle === null ) ?
            angle / 2 * (i + 1) : options.iconButtonArray[i].startRotationIconAngle,
            opacity = (options.iconOpacity === null) ? this.states.standartIconOpacity : options.iconOpacity;

          group.push( paper.image(ipath, 0, 0, iconSize, iconSize).attr({opacity: opacity}).transform(
            "T" + (box.x + box.width / 2 - iconSize / 2) + "," + (box.y + box.height / 2 - radius + innerRadius + iconSize / 2 - 1) +
            "R" + startRotationIconAngle).hover(
            function () {
              paper.getById(this.id).attr({ opacity: options.styles.image.hover_opacity_in });
              //paper.getById(this.prev.id).attr({fill: "rgba(255, 255, 255, .9)"});
            },
            function () {
              paper.getById(this.id).attr({ opacity: options.styles.image.hover_opacity_out });
              //paper.getById(this.prev.id).attr({fill: "rgba(255, 255, 255, .5)"});
            }
          ));
        }
      }

      var set = paper.set(group).mousedown(this.props.callbacks[i].click);

      arrowComponentsArray.push(set);
    }

    var circle = paper.circle().attr({
      fill: options.styles.circle.fill,
      r: innerRadius,
      opacity: options.styles.circle.opacity,
      // положение центра круга
      cx: radius + .5,
      cy: radius + .5,
      stroke: options.styles.circle.stroke
    });

    arrowComponentsArray.push(circle);

    var component = paper.set(arrowComponentsArray);
    component.circleRadius = circle.attrs.r;

    this.component = component;

    circle.drag(this.dragMove, this.dragDown, this.dragUp);
  },

  dragMove: function (dx, dy, event) {
    this.component.items.forEach((item, i) => {
      if (item.type == "circle") {
        item.attr({
          fill: this.props.opt.styles.circle.onDrag.fill,
          opacity: this.props.opt.styles.circle.onDrag.opacity
        });

        return;
      }

      item.attr({
        fill: this.props.opt.styles.path.onDrag.fill,
        opacity: this.props.opt.styles.image.hover_opacity_in
      });
    });

    var top = parseInt(this.oy) + parseInt(dy),
      height = this.refs.arrowMenu.offsetHeight,
      left = parseInt(this.ox) + parseInt(dx),
      width = this.refs.arrowMenu.offsetWidth;

    if (top < this.props.parentRect.top) {
      top = this.props.parentRect.top;
    }

    //if (top + height > this.props.parentRect.top + this.props.parentRect.height) {
    //  top = this.props.parentRect.top + this.props.parentRect.height - height;
    //}

    if (top + height > this.props.parentRect.bottom) {
      top = this.props.parentRect.bottom - height;
    }

    if (left < this.props.parentRect.left) {
      left = this.props.parentRect.left;
    }

    if (left + width > this.props.parentRect.right) {
      left = this.props.parentRect.right - width;
    }

    this.setState({ style: { top: top, left: left } });
  },

  dragDown: function (x, y, event) {
    var options = this.props.opt;

    this.ox = this.refs.arrowMenu.offsetLeft;
    this.oy = this.refs.arrowMenu.offsetTop;

    this.component.items.forEach(function (item, i) {
      if (item.type == "circle") {
        item.stop();
        item.animate({
          fill: options.styles.circle.onDrag.fill,
          r: item.attrs.r + 5,
          opacity: options.styles.circle.onDrag.opacity
        }, 200, ">");

        return;
      }

      item.stop();
      item.animate({
        fill: options.styles.path.onDrag.fill,
        opacity: options.styles.image.hover_opacity_in
      }, 200, ">");
    });
  },

  dragUp: function () {
    var options = this.props.opt;

    var r = this.component.circleRadius;

    this.component.items.forEach(function (item, i) {
      if (item.type == "circle") {
        item.stop();
        item.animate({
          r: r,
          opacity: options.styles.circle.opacity,
          fill: options.styles.circle.fill
        }, 200, ">");

        return;
      }

      item.stop();
      item.animate({
        fill: options.styles.path.fill,
        opacity: options.styles.image.hover_opacity_out
      }, 200);
    });
  },

  changeItemsAttr: function (items, x, y, is_drag) {
    var comp = this;

    items.forEach(function (item, i) {
      if (item.type == 'path') {

      } else if (item.type == 'circle') {

        if (is_drag) {

        } else {
          item.ox = item.attrs.cx;
          item.oy = item.attrs.cy;
        }
      } else if (item.type == 'image') {

      } else if (item.type == 'set') {

        comp.changeItemsAttr(item, x, y);
      }
    });
  },

  render: function () {
    return <div ref='arrowMenu' className="arrow-menu" style={this.state.style} />;
  }
});

export default ArrowMenu;

module.exports = ArrowMenu;