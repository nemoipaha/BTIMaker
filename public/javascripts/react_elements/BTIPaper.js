import React from 'react';

var BTIPaper = React.createClass({
    getInitialState: function () {
        return {
            current:{
                scroll:{
                    x:0,
                    y:0
                },
                position:{
                    x:0,
                    y:0
                }
            },
            scale: 1,
            paper: null,
            tapes:{
                vertical: null,
                horizontal:null
            },
            "mesh-lines":{
                vertical:{
                    main:null,
                    sub:null
                },
                horizontal:{
                    main:null,
                    sub:null
                }
            }
        };
    },
    _loadDataFromServer: function () {
        var parent = this;
        $.ajax({
            url: "/option",
            method: "post",
            data: {
                type: 'app',
                data: 'paper'
            },
            async:false,
            dataType: "json",
            success: function (data,status){
                if(status == 'success') parent['state']['data'] = data;
                else console.log(status);
            },
            fail: function (jqXHR, textStatus) {
                alert("Request failed: " + textStatus);
            }
        });
    },
    isNotValid: function () {
        if(!this.state['data'] || !this.state['user-scale'] || !this.isMounted()) return false;
        var opt = this.props['paper'], min = this.state['data']['min-real-mesh-step'];
        if(typeof  opt['height'] != 'number' || typeof  opt['width'] != 'number'
        || typeof  opt['mesh-step'] != 'number' || typeof min != 'number') return false;
        if(parseInt(opt['mesh-step']) < parseInt(min)) return false;
        return (parseInt(opt['height']) < parseInt(opt['mesh-step']) || parseInt(opt['width']) < parseInt(opt['mesh-step']));
    },
    mightUpdate:function(flag){
        if(flag) return (this.state['scale'] < parseFloat(this.state['data'].range['max']));
        else return (this.state['scale'] > parseFloat(this.state['data'].range['min']));
    },
    updatePaper: function(flag){
        if(flag){
            if(this.state['scale'] >= parseFloat(this.state['data'].range['max'])) return null;
            flag = 1;
        } else {
            if(this.state['scale'] <= parseFloat(this.state['data'].range['min'])) return null;
            flag = -1;
        }
        var opt  = {
            scale: this.state['scale']
        };
        this.state['scale'] += flag * parseFloat(this.state['data'].range['step']);
        this._onCreatePanel();
        this._createTape(true);
        this._createTape(false);
        opt['scale'] = this.state['scale']/opt['scale'];
        opt['paper'] = this.state['paper'];
        return opt;
    },
    updateGrid: function(flag){
        if(typeof flag == 'boolean') this.props['paper']['grid'] = flag;
        var name = ((this.props['paper']['grid']) ? 'show' : 'hide'),
            update = function(e){
                    var items = e['items'];
                    for(var i in items) items[i][name]();
            };
        update(this.state["mesh-lines"]['vertical']['main']);
        update(this.state["mesh-lines"]['horizontal']['main']);
        update(this.state["mesh-lines"]['vertical']['sub']);
        update(this.state["mesh-lines"]['horizontal']['sub']);
    },
    realToUser: function(){
        return parseFloat(this['props'].paper['width'] /  this.state['paper']['width']);
    },
    userToReal: function(){
        return parseFloat(this.state['paper']['width'] / this['props'].paper['width']);
    },
    _createTape:function(panelMode){
        if (this.isNotValid() || typeof panelMode != 'boolean') return;
        var size = null, rect = null, paper = null, line = null,scroll = null, single,
            step = {
                single: this._realStep(),
                short: this._shortStep(),
                user: null
            },
            opt = this.state['data']['draw'],
            lineOpt = {
                opacity: opt['line']['opacity'],
                'stroke-width': opt['line']['stroke']
            };
        if(panelMode){
            if (this.state['tapes']['vertical']) this.state['tapes']['vertical'].remove();
            paper = this.state['tapes']['vertical'] = Raphael(this.refs['vertical-tape']);
            rect = this.refs['vertical-tape'].getBoundingClientRect();
            line = {
                main: [
                    "M", parseFloat(rect['width'] / opt['line']['padding']), 0,
                    "L", parseFloat(rect['width'] / opt['line']['padding']), rect['height'] - opt['line']['padding']
                ],
                border: [
                    "M", rect['width'] - 1, 0,
                    "L", rect['width'] - 1, rect['height']
                ]
            };
            size = {
                current:rect['height'],
                main:this.state['paper']['height']
            };
            scroll = this.state['current']['scroll']['y'];
        } else {
            if (this.state['tapes']['horizontal']) this.state['tapes']['horizontal'].remove();
            paper = this.state['tapes']['horizontal'] = Raphael(this.refs['horizontal-tape']);
            rect = this.refs['horizontal-tape'].getBoundingClientRect();
            line = {
                main: [
                    "M", 0, rect['height'] / opt['line']['padding'],
                    "L", rect['width'] - opt['line']['padding'], rect['height'] / opt['line']['padding']
                ],
                border:[
                    "M", 0, rect['height'] - 1,
                    "L", rect['width'], rect['height'] - 1
                ]
            }
            size = {
                current:rect['width'],
                main:this.state['paper']['width']
            };
            scroll = this.state['current']['scroll']['x'];
        }
        paper.path(line['main']).attr($.extend(lineOpt,{ stroke: opt['line']['mesh']['main'] }));
        paper.path(line['border']).attr({opacity:opt['line']['opacity']});
        var distance = parseInt(this.state['data']['mesh']['distance']),
            i =  parseInt(step['short'] - scroll % step['short']);
        if (size['current'] > size['main']) size['current'] = size['main'];
        step['user']  = parseInt(this.props['paper']['mesh-step']);
        if (panelMode) {
            var height = this.props['paper']['height'] - parseInt(scroll/step['single']) * parseInt(this.props['paper']['mesh-step']);
            for(; i < size['current']; i += step['short']) {
                single = Boolean(parseInt((i + scroll)/step['short']) % distance);
                paper.path(["M", Math.round(rect['width'] / opt['line']['padding'] + opt['line']['stroke-width'] / 2),
                    i, "L", Math.round(rect['width'] / 2 - (single ? 1 : -1)), i]).
                    attr($.extend(lineOpt,{
                        stroke: (single ? opt['line']['mesh']['sub'] : opt['line']['mesh']['main'])
                    })
                );
                if (!single) {
                    single = paper.text(
                        Math.round(rect['width']*3./4 - 1),i,
                        height - step['user']
                    ).attr(opt['text'])
                     .rotate(270,rect['width']*3/4,i);
                    if(i + single.getBBox()['height']/2 > size['current']) {
                        single.remove();
                        return;
                    }
                    step['user'] += parseInt(this.props['paper']['mesh-step']);
                }
            }
        }else{
            step['user'] += parseInt(scroll/step['single']) * parseInt(this.props['paper']['mesh-step']);
            for(; i < size['current']; i += step['short']) {
                single = Boolean(Math.round((i + scroll)/step['short']) % distance);
                paper.path([
                    "M", i, Math.round(rect['height']/opt['line']['padding'] + opt['line']['stroke-width']/2),
                    "L", i, Math.round(rect['height']/2 - (single ? 1:-1))
                ]).attr($.extend(lineOpt,{
                        stroke: (single ? opt['line']['mesh']['sub'] : opt['line']['mesh']['main'])
                    })
                );
                if (!single) {
                    single = paper.text(i,Math.round(rect['height']*3./4 - 1),step['user']).attr(opt['text']);
                    if(i + single.getBBox()['width']/2 > size['current']) {
                        single.remove();
                        return;
                    }
                    step['user'] += parseInt(this.props['paper']['mesh-step']);
                }
            }
        }
    },
    _onPanelScroll: function (e) {
        // console.log(e);
        if (this.isNotValid()) return;
        if (this._isMinEditorRectResize()) return;
        if (this.state['current']['scroll']['x']!= this.refs['panel']['scrollLeft']) {
            this.state['current']['scroll']['x'] = this.refs['panel']['scrollLeft'];
            this._createTape(false);
        }
        if (this.state['current']['scroll']['y']!= this.refs['panel']['scrollTop']) {
            this.state['current']['scroll']['y'] = this.refs['panel']['scrollTop'];
            this._createTape(true);
        }
    },
    _onCreatePanel: function () {
        if (this.isNotValid()) return;
        var rect = this.refs['panel'].getBoundingClientRect(),// ������� ������� ����������, � ������� ����� ������ ��������� ��� ���������
            min = this.state['data']['min-real-scale'],// ���������� �������� ������� ��� �������� ����������
            opt = this.state['data']['draw']['line'], // ����� ��� ��������� ����� ��������
            paper = this.props['paper'], // ����� ���������� ��� �������� ����������
            distance = parseInt(this.state['data']['mesh']['distance']),
            step = { // ��� ��� ��������� ����� � �������� �����������
                min: parseInt(this.state['data']['mesh']['step']),
                real: null
            },xt,yt;

        step['real'] = ((paper['is-fixed']) ?
                paper['static-real-step'] * paper['mesh-step']:
                Math.max(Math.ceil(parseFloat(paper['mesh-step'] *
                Math.max(rect['width'],min['width'])) / paper['width']),
                Math.ceil(parseFloat(paper['mesh-step'] *
                Math.max(rect['height'],min['height'])) / paper['height']))
        );
        if (step['real'] <  step['min'])  step['real'] =  step['min'];

        step['real'] *= this.state['scale'];
        step['real'] += this.state['scale'];
        xt = parseInt(Math.ceil(parseFloat(step['real'] * paper['width']) / paper['mesh-step'])),
            yt = parseInt(Math.ceil(parseFloat(step['real'] * paper['height']) / paper['mesh-step']));
        if (this.state['paper'])  this.state['paper'].remove();
        this.state['paper'] = Raphael(this.refs['panel'],xt,yt);

        var short = parseInt(step['real'] / this.state['data']['mesh']['distance']),
            main = [],
            sub = [],
            line;

        for (var i = short; i < xt; i += short) {
            line = this.state['paper'].path(["M", i, 0, "L", i, yt]).attr({opacity: opt['opacity']});
            if (parseInt(i/short) % distance) sub.push(line.attr({stroke: opt['mesh']['sub']}));
            else main.push(line.attr({stroke: opt['mesh']['main']}));

        }
        this.state["mesh-lines"]['vertical']['main'] = this.state['paper'].set(main);
        this.state["mesh-lines"]['vertical']['sub'] = this.state['paper'].set(sub);

        sub = []; main = [];

        for (var i = short; i < yt; i += short) {
            line = this.state['paper'].path(["M", 0, i, "L",xt, i]).attr({opacity: opt['opacity']});
            if (parseInt(i/short) % distance) sub.push(line.attr({stroke: opt['mesh']['sub']}));
            else main.push(line.attr({stroke: opt['mesh']['main']}));
        }
        this.state["mesh-lines"]['horizontal']['main'] = this.state['paper'].set(main).toBack();
        this.state["mesh-lines"]['horizontal']['sub'] = this.state['paper'].set(sub).toBack();
        this.updateGrid();
        line = {
            opacity: opt['opacity'],
            stroke: '#' + opt['mesh']['sub'],
            'stroke-width': opt['stroke-width'] * 2
        };
        this.state['paper'].path(["M",xt,0,"L",xt,yt]).attr(line);
        this.state['paper'].path(["M",0,yt,"L",xt,yt]).attr(line);
    },
    _onResize: function () {
        if (this.isNotValid()) return;
        if (this._isMinEditorRectResize()) {
            var ot = this._realStep();
            this._onCreatePanel();
            ot = this._realStep() / ot;
            this.state['current']['scroll']['x'] = this.refs['panel']['scrollLeft'] = this.state['current']['scroll']['x'] * ot;
            this.state['current']['scroll']['y'] = this.refs['panel']['scrollTop']  = this.state['current']['scroll']['y'] * ot;
        }
        this._createTape(true);
        this._createTape(false);
    },
    componentWillUnmount: function () {
        this.refs['panel'].removeEventListener("scroll", this._onPanelScroll);
        this.refs['panel'].removeEventListener("click", this._onEditorClick);
        this.refs['panel'].removeEventListener("mousemove", this._onEditorMouseWheel);
        window.removeEventListener("keypress", this._onEditorKeyPress);
        window.removeEventListener("resize", this._onResize);
    },
    componentDidMount: function () {
        this._loadDataFromServer();
        this._onCreatePanel();
        if( this.props['paper']['add-paper']) this.props['paper']['add-paper'](this.state['paper']);
        this._createTape(true);
        this._createTape(false);
        window.addEventListener("resize", this._onResize);
        window.addEventListener("keypress", this._onEditorKeyPress);
        this.refs['panel'].addEventListener("scroll", this._onPanelScroll);
        this.refs['panel'].addEventListener("click", this._onEditorClick);
        this.refs['panel'].addEventListener("mousemove", this._onEditorMouseWheel);
        this.refs['panel'].addEventListener("mouseleave",this._onMouseLeave);
        this.refs['panel'].addEventListener("mouseenter",this._onMouseEnter);
    },
    _onMouseLeave: function(e){
        if(this.props['paper'].leave) this.props['paper'].leave(e);
    },
    _onMouseEnter: function(e){
        if(this.props['paper'].leave) this.props['paper'].enter(e);
    },
    _onEditorKeyPress:function(e){
       /* var keys  = this.state['data']['char'];
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        switch(e['keyCode']){
            case keys['up']:
                this._onTopScroll();
                break;
            case keys['down']:
                this._onBottomScroll();
                break;
            case keys['left']  :
                this._onLeftScroll();
                break;
            case keys['right'] :
                this._onRightScroll();
                break;
        }*/
    },
    _onEditorMouseWheel: function (e) {
        if (this.isNotValid()) return;
        var rect = this.refs['panel'].getBoundingClientRect();
        if(this.props['paper']['move']) this.props['paper']['move']({
            x: parseInt(e['clientX'] - rect['left'] + this.refs['panel']['scrollLeft']),
            y: parseInt(e['clientY'] - rect['top'] + this.refs['panel']['scrollTop'])
        });
    },
    _onEditorClick: function (e) {
        if (this.isNotValid()) return;
        var rect = this.refs['panel'].getBoundingClientRect();
            if(this.props['paper']['click']) this.props['paper']['click']({
                x: parseInt(e['clientX'] - rect['left'] + this.refs['panel']['scrollLeft']),
                y: parseInt(e['clientY'] - rect['top']  + this.refs['panel']['scrollTop'])
            });
    },
    _realStep: function () {
        if (this.isNotValid()) return null;
        return this.state['paper']['width'] * this.props['paper']['mesh-step'] / this.props['paper']['width'];
    },
    _isMinEditorRectResize: function () {
        if (this.isNotValid() || this.props['paper']['is-fixed']) return false;
        var rect = this.refs['panel'].getBoundingClientRect(), st = this._shortStep();
        return parseInt(rect['width'] - st > this.state['paper']['width'] ||
                        rect['height'] - st > this.state['paper']['height']);
    },
    _shortStep: function () {
        return (this.isNotValid()) ? null : parseInt(this._realStep() / parseInt(this.state['data']['mesh']['distance']));
    },
    _onTopScroll: function () {
        if (this.isNotValid())  return;
        this.refs['panel'].scrollTop -= this._shortStep();
    },
    _onLeftScroll: function () {
        if (this.isNotValid())  return;
        this.refs['panel'].scrollLeft -= this._shortStep();
    },
    _onRightScroll: function () {
        if (this.isNotValid())  return;
        this.refs['panel'].scrollLeft += this._shortStep();
    },
    _onBottomScroll: function () {
        if (this.isNotValid())  return;
        this.refs['panel'].scrollTop += this._shortStep();
    },
    _optButtonClick: function () {
    },
    render: function () {
        return (
            <div ref = 'container' className="bti-paper-container" >
                <div onClick={this._optButtonClick} className='bti-button'></div>
                <div ref='horizontal-tape' className = 'bti-horizontal-panel' ></div>
                <div ref='vertical-tape' className = 'bti-vertical-panel' ></div>
                <div ref='panel' className='bti-paper'></div>
            </div>
        );
    }
});
module.exports = BTIPaper;
export default BTIPaper;