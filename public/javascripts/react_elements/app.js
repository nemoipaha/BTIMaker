import React from 'react';
import ReactDOM from 'react-dom';
import BTITabBar from './tabs';
import BTIArrowMenu from './arrowmenu';
import BTIPaper from './BTIPaper'
import BTIToolBar from './BTIToolBar'
import BTIElementDialog from './BTIElementDialog'
import LeftMenu from './menu';
import User from './user';

var BTIAppComponent = React.createClass({
  getInitialState: function () {
    var state = {
      controller: null,
      'arrow-menu': null,
      languageId: 'ru',
      user: null
    };

    state.languageStrings = this.getLanguage(state.languageId, 'editor');

    $.ajax({
      type: "GET",
      url: "/controller",
      async: false,
      dataType: "script"
    });
    $.ajax({
      type: "post",
      url: "/user",
      async: false,
      success: function (data) {
        if (data.user) state.user = data.user;
        //console.log(data);
      },
      error: function (err) {
        console.error(err);
      }
    });
    $.ajax({
      url: "/option",
      method: "POST",
      async: false,
      data: {
        type: 'app',
        data: 'arrowmenu'
      },
      dataType: "json",
      success: (option)=> {
        state['arrow-menu'] = option;
      },
      fail: (jqXHR, textStatus) => {
        console.log("Request failed: " + textStatus);
      }
    });
    if (BTIAppController) {
      $.ajax({
        url: "/option",
        method: "POST",
        async: false,
        data: {
          type: 'app',
          data: 'objects'
        },
        dataType: "json",
        success: (data)=> {
          BTIAppController['type-manager'].add(data['attrs'], data['dir']);
          state.menuItems = BTIAppController['type-manager'].getMenuItems();
        },
        fail: (jqXHR, textStatus)=> {
          console.log("Request failed: " + textStatus)
        }
      });
      $.ajax({
        type: "GET",
        url: "/extends",
        async: false,
        dataType: "script"
      });

      state['controller'] = BTIAppController;
    }
    return state;
  },

  getLanguage: function (lang, type) {
    var strings = {};

    $.ajax({
      url: '/language/' + lang + '/' + type,
      dataType: 'json',
      async: false,
      type: 'post',
      success: (data) => {
        if (data) {
          strings = data;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });

    return strings;
  },

  childContextTypes: {
    lang: React.PropTypes.object.isRequired,
    user: React.PropTypes.object,
    tabs: React.PropTypes.array
  },

  getChildContext: function() {
    return {
        lang: this.state.languageStrings,
        user: this.state.user,
        tabs: this.state.tabs
    };
  },
  createUserProjectTabs() {
        //if (this.refs['tab-bar'].tabs.length) this.refs['tab-bar'].removeAll();
        console.log(this.state.user);
        if (this.state.user) {
            if (this['state'].user['projects'].length) {
                for (var i = 0; i < this['state'].user['projects'].length; ++i) {
                    var opt = Object.assign({},this.state['user'].projects[i].options);
                    opt['objects'] = this.state['user'].projects[i].objects;
                    this.refs['tab-bar'].addTab({
                        id:this.state['user'].projects[i].name,
                        name: this.state['user'].projects[i].name,
                        remove: true
                    },opt);
                }
            }
        } else {
            this.refs['tab-bar'].addTab({
                id:'Test',
                name: 'Test',
                remove: true
            },{
                height: 250,
                width: 200,
                grid: true,
                "mesh-step": 25,
                "draw-mode":false,
                "wall-sel-min": false
            });
        }
        this.setState({ tabs: this.refs['tab-bar'].getTabs() });
    },
  componentDidMount: function () {
      var dialog = this.refs['element-dialog'];
      this.state['controller'].callbacks = {
          edit:(element)=>{
              if(!element) return;
              var current = this.refs['tab-bar'].getUserData((element['paper'] ?
                      element['paper'] : BTIAppController['papers'].current)
              );
              dialog.setElement(element,(current ? current.realToUser() : 1));
              dialog.show();
          },
          update:()=>{
              if(dialog.isVisible()) dialog.update();
          },
          hide:()=>{
              if(dialog.isVisible()) dialog.hide();
          },
          remove:()=>{
              if(dialog.isVisible()) dialog.clear();
          },
          scale: (index)=>{
              if(!index) index = BTIAppController['papers'].current;
              var paper = this.refs['tab-bar'].getUserData(index);
              if(!paper) return 1;
              return paper.realToUser();
          }
      };
      this.createUserProjectTabs();
      this.refs['tab-bar'].selectTab('first');
      this.setState({ canvasRect: this.getCanvasRect() });

    $(window).on('resize', () => {
        this.setState({ canvasRect: this.getCanvasRect()});
    });
  },

  getCanvasRect() {
    var paperDom = this.refs['tab-bar']
      .getUserData(this.state['controller']['papers']['current']).refs.panel;

    var paperRect = paperDom.getBoundingClientRect();

    var scrollWidth = paperDom.offsetWidth - paperDom.clientWidth,
      scrollHeight = paperDom.offsetHeight - paperDom.clientHeight;

    paperRect = {
      top: paperRect.top,
      left: paperRect.left,
      bottom: paperRect.bottom - scrollHeight,
      right: paperRect.right - scrollWidth
    };

    return paperRect;
  },

  changeLocale: function (langId) {
    if (langId === this.state.languageId) return;
    this.setState({languageStrings: this.getLanguage(langId, 'editor'), languageId: langId});
  },

  saveUserData: function(paperIds) {
    if(!BTIAppController || !paperIds.length)  return;
    var projects = [];
    paperIds.forEach((id) => {
      var paper = this.refs['tab-bar'].getUserData(id);
      if(!paper) return;
      var point  = BTIAppController['papers'].currentElement('point',id),
          objects = BTIAppController['papers'].getObjectsList(false,id);
      if(point) {
          var walls = BTIAppController['papers'].getObjectsByType('wall');
          var flag = false;
          for (var i in walls) if (walls[i].isHasPoint(point)) {
              flag = true;
              break;
          }
          if(!flag) {
              console.log('aaa');
             // delete objects[point.id];
          }
      }
      var name = this.refs['tab-bar'].getTabName(id),
          scale = paper.realToUser();
      var options = BTIAppController['papers'].paperOpt(null,id);
      for(var i in objects){
          var data = {
              id:  objects[i].id,
              type: objects[i].type
          }
          switch(objects[i].type){
              case 'wall':
                  data['points'] = {
                      start: objects[i].points['start'].id,
                      end: objects[i].points['end'].id
                  };
                  console.log(data['points']);
                  data['positions'] = objects[i].getArrayOfFoundationPoints();
                  break;
              case 'point': data['positions'] = objects[i].getCenterCoord();
                  break;
              case 'simple-door':
              case  'double-door':
              case  'sliding-door':
              case  'window':
                  data['opt'] = {
                      wall: objects[i].wall['id'],
                      thickness: (parseFloat(objects[i].opt['thickness']) * scale),
                  }
                  data['positions'] = objects[i].getFoundationPoints();
                  if(objects[i].type == 'simple-door' || objects[i].type == 'double-door') {
                      data['opt'].position = objects[i].opt['position'];
                  }
                  break;
              case 'room':
                  data['walls'] = Object.keys(objects[i].walls);
                  break;
          }
          if(data['positions']){
              if(objects[i].type != 'point')
                  for(var j in data['positions']){
                      data.positions[j].x = (data.positions[j].x * scale).toString();
                      data.positions[j].y = (data.positions[j].y * scale).toString();
                  }
              else {
                  data['positions'].x = (data['positions'].x * scale).toString();
                  data['positions'].y = (data['positions'].y * scale).toString();
              }
          }
          objects[i] = data;
      }
      var temp = Object.assign({},options);
     for(var i in temp) temp[i] = temp[i] + '';
        console.log(objects);
      projects.push({
          name: name,
          options: temp,
          objects: objects
      });
        console.log(BTIAppController['papers'].getObjectsList(false,id));
    });
    $.ajax({
      type: 'post',
      url: '/user/projects/update',
      data: { data: projects},
      success: () => {
          this.setState({ user: $.extend(this.state.user, { projects: projects }) });
      },
      error: (err) => { console.error(err); }
    });
  },

  updateUser: function(user) {
    this.setState({ user: user });
  },
  viewMode: function(){
      if(!BTIAppController) return;
      BTIAppController['papers'].setPaperOpt('draw-mode',false);
      var point  = BTIAppController['papers'].currentElement('point');
      if(point) {
          BTIAppController['papers'].setCurrentElement('point', null);
          BTIAppController['papers'].setCurrentElement('wall', null);
          var component = BTIAppController['papers'].getElementById('service-wall', true),
              walls = BTIAppController['papers'].getObjectsByType('wall'),
              flag = false;
          for(var i in walls) if(walls[i].isHasPoint(point)){
              flag = true;
              break;
          }
          if(!flag) BTIAppController['papers'].removeElement(point.id);
          if(component) component.hide();
      }
  },
  render: function () {
    return React.createElement('div', {
             ref: 'main-container',
             className: 'main-container'
           }, React.createElement(BTIToolBar, {
                ref: "toolbar",
                lang: Object.assign(this.state['languageStrings'].toolbar, {
                  id: this.state['languageId'],
                  authRegDlg: this.state['languageStrings'].authRegDlg,
                  newTabDlg: this.state['languageStrings'].newTabDlg,
                  userSettingsDlg: this.state['languageStrings'].userSettingsDlg,
                  saveDlg: this.state['languageStrings'].saveDlg
                }),
                user: (this['state'].user ? this['state'].user : null),
                userLogin: (user) => {
                    if (!user) return;
                    this.setState({ user: user });
                    this.createUserProjectTabs();
                },
                saveUserData: (papersIds) => {
                    this.saveUserData(papersIds);
                },
                updateUser: (projects) => this.updateUser(projects),
                userLogout: () => {
                    $.ajax({
                        url: '/logout',
                        type: 'post',
                        success: (data) => {
                            if (data.success) {
                                this.refs['tab-bar'].removeAll();
                                this.setState({ user: null, tabs: [] });
                                this.createUserProjectTabs();
                            }
                        },
                        error: (error) => {
                            console.error(error);
                        }
                    });
                },
                openLeftMenu:()=>{
                    $(ReactDOM.findDOMNode(this['refs'].leftMenu)).stop().animate({ width: 'toggle'});
                },
                toggleGrid: () => {
                    if (!BTIAppController) return;
                    var flag = !(BTIAppController['papers'].paperOpt('grid'));
                    var current = this.refs['tab-bar'].getUserData(BTIAppController['papers'].current);
                    if (current){
                        current.updateGrid(flag);
                        BTIAppController['papers'].setPaperOpt('grid',flag);
                    }
                },
                scaleClick:(flag)=>{
                  if(!BTIAppController) return;//getObjectsList
                   var current = this.refs['tab-bar'].getUserData(BTIAppController['papers'].current);
                   if(!current) return;
                    this.viewMode();
                    if(!current.mightUpdate(flag)) return;
                    var objects = BTIAppController['papers'].getObjectsList();
                    for(var i in objects){
                      var data = null;
                      switch(objects[i].type){
                        case 'wall': data = objects[i].getArrayOfFoundationPoints();
                           break;
                        case 'point': data = objects[i].getCenterCoord();
                            break;
                        case 'simple-door':
                        case  'double-door':
                        case  'sliding-door':
                        case  'window':
                            data = objects[i].getFoundationPoints();
                            break;
                        case 'room': break;
                      }
                      objects[i].remove();
                      objects[i] = {
                        object: objects[i],
                        data:data
                      }
                    }
                    var service = BTIAppController['papers'].getObjectsList(true);
                    var opt = current.updatePaper(flag);
                    if(!opt) return;
                    BTIAppController['papers'].setCurrentContext(opt['paper'],BTIAppController['papers'].current);
                    for(var i in service){
                        service[i].remove();
                        service[i].recreate(opt['paper']);
                    }
                    for(var i in objects) if(objects[i].object['type'] == 'wall') {
                      for(var j in objects[i].data) {
                        objects[i].data[j].x *= opt['scale'];
                        objects[i].data[j].y *= opt['scale'];
                      }
                      objects[i]['object'].recreate(opt['paper'],objects[i].data);
                      delete objects[i];
                    }
                     for(var i in objects) if(objects[i].object['type'] == 'point') {
                        objects[i].data['x']*= opt['scale'];
                        objects[i].data['y']*= opt['scale'];
                        objects[i]['object'].recreate(opt['paper'],objects[i].data);
                        delete objects[i];
                    }
                    for(var i in objects)
                      if(objects[i].object['type'] == 'room') {
                        objects[i]['object'].recreate(opt['paper'],true);
                        delete objects[i];
                    }
                    for(var i in objects){
                        for(var j in objects[i].data) {
                          objects[i].data[j].x *= opt['scale'];
                          objects[i].data[j].y *= opt['scale'];
                        }
                        objects[i]['object'].recreate(opt['paper'],{
                          thickness: (objects[i].object['wall'].getThickness() / 2),
                          points: objects[i].data
                        });
                        delete objects[i];
                      }
                    current = BTIAppController['papers'].currentElement('door',BTIAppController['papers'].current);
                    if(current) {
                        BTIAppController['type-manager'].types[current['type']].callbacks['invalidate'].apply(current);
                        current.select(true);
                    }
                    var array = ['window', 'double-door', 'simple-door', 'sliding-door'],
                        types = BTIAppController['type-manager'].types;
                    for(var i in array){
                        types[array[i]].opt['width'] = parseFloat(types[array[i]].opt['width']) * opt['scale'];
                        types[array[i]].opt['min-width'] = parseFloat(types[array[i]].opt['min-width']) * opt['scale'];
                    }
                    BTIAppController['type-manager'].types['wall'].opt['thickness'] =
                        parseFloat(BTIAppController['type-manager'].types['wall'].opt['thickness'])  * opt['scale'];
                },
                drawMode:() =>{
                    if(BTIAppController) BTIAppController['papers'].setPaperOpt('draw-mode',true);
                },
                viewMode:()=>{this.viewMode()},
                changeLocale: (langId) => this.changeLocale(langId),
                addTab: (opt) => {
                  this.refs['tab-bar'].addTab({
                    id: opt['name'],
                    name: opt['name'],
                    remove: true
                  },opt);
                }
              }),
              React.createElement(LeftMenu, {
                ref: "leftMenu",
                elements: this.state['menuItems'],
                lang: this.state['languageStrings'].menu,
                parentRect: this.state.canvasRect,
                createObject: (type, pos) => {
                    if(!BTIAppController) return;
                    var panel = this.refs['tab-bar'].getUserData(BTIAppController.papers['current']);
                    if(!panel) return;
                    panel = panel.refs['panel'];
                    var point = {
                        y: panel.scrollTop + pos.top - this['state'].canvasRect['top'],
                        x: panel.scrollLeft + pos.left - this['state'].canvasRect['left']
                    };
                    if(point['x'] <= 0 || point['y'] <= 0)  return;
                    var walls = BTIAppController['papers'].getObjectsByType('wall')
                    for(var i in walls) if(Math.isPointInPolygon(point,walls[i].getArrayOfFoundationPoints())){
                      var points = BTIAppController['type-manager'].types['wall'].callbacks['valid-point'].apply(
                          walls[i],[{
                            type:type,
                            current: point
                          }]
                      );
                      if (!points) return null;
                      var element =  BTIAppController['papers'].createElement(type);
                      if(!element) return null;
                      var path = walls[i].element[0].attr('path');
                      element.recreate(
                          BTIAppController['papers'].currentContext(),{
                            points: points,
                            thickness: (walls[i].getThickness() / 2)
                          },walls[i]);
                      var  old = BTIAppController['papers'].currentElement('door');
                      if(old &&  old.wall['id'] == walls[i].id)
                        BTIAppController['type-manager'].types[old['type']].callbacks['invalidate'].call(old);
                      break;
                    }
                  }
              }),
              React.createElement(BTIArrowMenu, {
                ref: 'arrow-menu',
                opt: this.state['arrow-menu'],
                parentRect: this['state'].canvasRect,
                callbacks: [{
                    "click": () => {
                      if(!BTIAppController) return;
                      var current = this.refs['tab-bar'].getUserData(BTIAppController['papers'].current);
                      if(current) current._onTopScroll()
                    },
                  }, {
                    "click": () => {
                      if(!BTIAppController) return;
                      var current = this.refs['tab-bar'].getUserData(BTIAppController['papers'].current);
                      if(current) current._onRightScroll()
                    },
                  }, {
                    "click": ()=> {
                      if(!BTIAppController) return;
                      var current = this.refs['tab-bar'].getUserData(BTIAppController['papers'].current);
                      if(current) current._onBottomScroll()
                    },
                  }, {
                    "click": ()=> {
                      if(!BTIAppController) return;
                      var current = this.refs['tab-bar'].getUserData(BTIAppController['papers'].current);
                      if(current) current._onLeftScroll()
                    },
                  }]
              }),
              React.createElement(BTITabBar, {
                ref: "tab-bar",
                onAddTab: (id, opt) => {
                    var objects = null;
                    if(opt['static-real-step'] == "" || opt['static-real-step']  == null) delete opt['static-real-step'];
                    else opt['static-real-step'] = parseInt(opt['static-real-step']);
                    if(opt['grid'] == null)  opt['grid'] = true;
                    opt['width'] = parseInt(opt['width']);
                    opt['height'] = parseInt(opt['height']);
                    opt['mesh-step'] = parseInt(opt['mesh-step']);
                    if(opt['draw-mode'] == null) opt['draw-mode'] = false;
                    if(typeof opt['is-fixed'] == 'string') opt['is-fixed'] = ((opt['is-fixed'] == 'false')? false: true);
                    if(typeof opt['wall-sel-min'] == 'string') opt['wall-sel-min'] = ((opt['is-fixed'] == 'false')? false: true);
                    if(opt['objects']){
                        objects = Object.assign({},opt['objects']);
                        delete opt['objects'];
                    }
                    var tabs = this.refs['tab-bar'];
                    var data = ReactDOM.render(React.createElement(BTIPaper, {
                        paper: Object.assign({
                          'add-paper': function (paper) {
                              if(BTIAppController) BTIAppController['papers'].addPaper(paper, opt, id);
                          },
                          click: function (position) {
                              if(!BTIAppController) return;
                              if(BTIAppController['papers'].paperOpt('draw-mode'))
                                BTIAppController['papers'].createElement('point', position);
                          },
                          move: function (position) {
                              if(!BTIAppController) return;
                              if(BTIAppController['papers'].paperOpt('draw-mode')) {
                                var component = BTIAppController['papers'].getElementById('service-wall', true);
                                var point = BTIAppController['papers'].currentElement('point');
                               if (component) {
                                   if(point) {
                                       component.show();
                                       component.setEndPoint(position);
                                   }else component.hide();
                               }
                            }
                          },
                          leave: function(){
                              if(!BTIAppController) return;
                              if(BTIAppController['papers'].paperOpt('draw-mode')) {
                                  var component = BTIAppController['papers'].getElementById('service-wall', true);
                                  if (component) component.hide();
                              }
                          },
                          enter:  function(){
                              if(!BTIAppController) return;
                              if(BTIAppController['papers'].paperOpt('draw-mode')) {
                                  var component = BTIAppController['papers'].getElementById('service-wall', true);
                                  if (component) component.show();
                              }
                          }
                        }, opt)
                    }), tabs.getItemHTML(id));
                    tabs.setUserData(id, data);
                    if(objects) {
                        var scale = data.userToReal();
                        console.log(objects,"111");
                        for(var i in objects) if(!objects[i]) delete objects[i];
                        for (var i in objects) {
                            if (objects[i].type == 'point') {
                                objects[i].positions['x'] = parseFloat(objects[i].positions['x']) * scale;
                                objects[i].positions['y'] = parseFloat(objects[i].positions['y']) * scale;
                                console.log( objects[i].id,objects[i].positions['x'] ,objects[i].positions['y'],"");
                                BTIAppController['papers'].createElementFromDB(
                                    objects[i].id, 'point',
                                    objects[i].positions, id
                                )
                            }
                        }
                        for (var i in objects) {
                            if (objects[i].type == 'point') {
                                objects[i].positions['x'] = parseFloat(objects[i].positions['x']) * scale;
                                objects[i].positions['y'] = parseFloat(objects[i].positions['y']) * scale;
                                BTIAppController['papers'].createElementFromDB(
                                    objects[i].id, 'point',
                                    objects[i].positions, id
                                );
                            }
                        }
                        for (var i in objects) {
                            if (objects[i].type == 'wall') {
                                for (var j in objects[i].positions) {
                                    objects[i].positions[j].x = parseFloat(objects[i].positions[j].x) * scale;
                                    objects[i].positions[j].y = parseFloat(objects[i].positions[j].y) * scale;
                                }
                                BTIAppController['papers'].createElementFromDB(
                                    objects[i].id, 'wall', {
                                        points: {
                                            start: BTIAppController['papers'].getElementById(objects[i].points['start']),
                                            end: BTIAppController['papers'].getElementById(objects[i].points['end'])
                                        },
                                        positions: objects[i].positions
                                    }, id
                                )
                            }
                        }
                        for (var i in objects) {
                            if (objects[i].type == 'room') {
                                BTIAppController['papers'].createElementFromDB(
                                    objects[i].id, 'room', objects[i].walls, id)
                            }
                        }
                        for (var i in objects) {
                            if (['simple-door', 'double-door', 'sliding-door', 'window'].indexOf(objects[i].type) != -1) {
                                for(var j in objects[i].positions){
                                    objects[i].positions[j].x = parseFloat(objects[i].positions[j].x) * scale;
                                    objects[i].positions[j].y = parseFloat(objects[i].positions[j].y) * scale;
                                }
                                objects[i].opt['thickness'] = parseFloat(objects[i].opt['thickness']) * scale;
                                BTIAppController['papers'].createElementFromDB(
                                    objects[i].id,
                                    objects[i].type, {
                                        points: objects[i].positions,
                                        opt: objects[i].opt
                                    },
                                    id
                                );
                            }
                        }
                    }
                    BTIAppController['papers'].setPaperOpt('draw-mode',false);
                    console.log('qwerty');
                    BTIAppController['papers'].setCurrentElement('point',null);
                },
                onSelectTab: (id) => {
                  if(!BTIAppController) return;
                    BTIAppController['papers'].current = id;
                    var paper = this.refs['tab-bar'].getUserData(id);
                    paper._createTape(true);
                    paper._createTape(false);
                },
                lang: this.state['languageStrings'].tabs
              }),
              React.createElement(BTIElementDialog, {
                ref: "element-dialog",
                clear: function(element){
                  if(!element) return;
                  var type = element['type'];
                  if(['simple-door','double-door','sliding-door','window'].indexOf(element.type)) type = 'door';
                  var remove = BTIAppController['type-manager'].types[element['type']].callbacks['remove'];
                  if(remove) remove.apply(element);
                  else BTIAppController['papers'].setCurrentElement(type,null,
                      (element['paper'] ? element['paper'] :  BTIAppController['papers'].current)
                  );
                },
                  lang: $.extend(this.state['languageStrings'].propDlg,
                      {
                          elements: this.state['languageStrings'].elements,
                          editPropsDlg: this.state['languageStrings'].editPropsDlg
                      })
              })
            );
          }
});

ReactDOM.render(React.createElement(BTIAppComponent, {
    user: new User().getUserData()
}), document.getElementById('app-container'));
