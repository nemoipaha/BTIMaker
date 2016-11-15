import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/lib/dialog';
import Slider from 'material-ui/lib/slider';
import Checkbox from 'material-ui/lib/checkbox';
import RaisedButton from 'material-ui/lib/raised-button';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ColorComponent from "./colorComponent";
import RadioButton from 'material-ui/lib/radio-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';

const style = {
  width: 400,
  btn: {
    marginRight: '15px'
  },

};

var BTIAppElementDialog = React.createClass({
  render: function () {
    var component = null;
    if (this.state['record']) {
      switch (this.state['record'].type) {
        case 'color':
          component = <ColorComponent element={this.props.element}/>;
          break;
        case 'number':
          break;
        case 'combobox':
          component = [];
          var context = this['context']['lang'].elements[this['state'].object['element'].type].props;
          var current = this['state'].object['element'].attr(this.state['record'].key);
          if (this.state['record']['values'].length > 2) {
            for (var i in this.state['record']['values']) {
              var index = this.state['record']['values'][i];
              component.push(<MenuItem value={i} key={ i } primaryText={context[index]}
                                       onTouchTap={ () => {
              } }
              />);
            }
            component = (
              <SelectField value={current}
                           autoWidth={true}
                           onChange={(e,index,value)=>{
                            console.log(e,index,value);
                           }}>
                {component}
              </SelectField>
            );
          } else {
            var arr = [];
            for (var i in this.state['record']['values']) {
              var index = this.state['record']['values'][i];
              arr.push(<RadioButton key={ i }
                                    ref={  'check' + index }
                                    value={ index }
                                    label={context[index]}/>);
            }
            component = <RadioButtonGroup name="shipSpeed" defaultSelected={ current }
                                          onChange={ (e, value) => {
                  var ob = { key: this.state['record'].key, value: value };
                  //console.log(ob);
                  var prev = this['state'].object['element'].attr(this.state['record'].key);
                  this.previousProp = prev;
                  this['state'].object['element'].attr(ob);
                  $(this.refs['grid']).jtable('reload');
               } }
            >
              { arr }
            </RadioButtonGroup>;
          }
          break;
      }
    }
    return (
      <div ref="prop-dialog"
           onClick={this.onClick}
           className='prop-dialog'>
        <div className="header" ref="header">
          <div className="elem-desc">
            <FloatingActionButton
              mini={true}
              iconClassName="fa fa-trash"
              secondary={true}
              onClick={this.clear}/>
            <FloatingActionButton
              mini={true}
              iconClassName="fa fa-undo"
              secondary={true}/>
          </div>
          <div className="title">
            <div className="elem-icon">
              <img src={ this['state'].object ? this.state['object'].opt['image'] : ''}/>
            </div>
            <div className="">{ this['state'].object ?
              this.context['lang'].elements[this.state['object'].element['type']].title : ''
            }</div>
            <div className="close-btn" onClick={ this.hide }>
              <i className="fa fa-close fa-x"></i>
            </div>
          </div>
        </div>
        <div className="content" ref="content">
          <div ref="grid"/>
        </div>
        <div className="footer" ref="footer"/>
        <Dialog
          contentStyle={style}
          title={ this.props.lang.editPropsDlg.title }
          open={this.state['record'] != null}
          onRequestClose={ this.handleClose }
          autoScrollBodyContent={true}
          actions={[
                <RaisedButton
                  style={ style.btn }
                  label={ this.props.lang.editPropsDlg.cancelBtnText }
                  primary={true}
                  onTouchTap={ () => {
                     var ob = { key: this.state.record.key, value: this.previousProp };
                     this['state'].object['element'].attr(ob);
                     $(this.refs['grid']).jtable('reload');
                     this.setState({ record : null });
                  }}
                />,
                <RaisedButton
                  label="OK"
                  secondary={true}
                  onTouchTap={ () => {
                    this.setState({ record : null });
                  }}
                />
              ]}
        >
          {component}
        </Dialog>
      </div>
    );
  },
  getInitialState: function () {
    console.log( this.props['lang'].editPropsDlg );
    var opt = {
      scale: 1,
      object: null,
      record: null
    };
    $.ajax({
      type: "post",
      url: '/option',
      async: false,
      dataType: "json",
      data: {
        type: 'app',
        data: 'propdialog'
      },
      success: function (data) {
        opt = data;
      },
    });
    return opt;
  },
  handleClose: function() {
  },
  componentDidMount: function () {
    $(this.refs['prop-dialog']).draggable({containment: 'parent'});
  },
  componentDidUpdate: function () {
    if (this['state'].reload) $(this.refs['grid']).jtable('reload');
  },
  show: function () {
    $(this.refs['prop-dialog']).show();
  },
  hide: function () {
    $(this.refs['prop-dialog']).hide();
  },
  clear: function () {
    if (this['state'].object) {
      this.hide();
      if (typeof this.props['clear'] == 'function' && this['state'].object['element'])
        this['props'].clear(this['state'].object['element']);
      this.setState({
        object: null,
        record: null,
        reload: false
      });
    }
  },
  isVisible: function () {
    return $(this.refs['prop-dialog']).is(":visible")
  },
  update: function () {
    if (this['state'].object) $(this.refs['grid']).jtable('reload');
  },
  setScale: function (scale) {
    if (typeof scale == 'number') this.setScale({scale: scale});
    if (this['state'].reload) $(this.refs['grid']).jtable('reload');
  },
  setElement: function (element, scale) {
    var grid = $(this.refs['grid']);
    if (this['state'].object) {
      var opt = {};
      if (scale) opt['scale'] = scale;
      if (element['type'] == this.state['object'].element['type'] &&
        element.paper == this.state['object'].element['paper']) {
        if (element['id'] != this['state'].object['element']['id']) {
          opt['object'] = this.state['object'];
          opt.object['element'] = element;
          for (var i in opt.object['old']) opt.object['old'][i] = element.attr(i);
        }
        if (scale) opt['scale'] = scale;
        this.setState(opt);
        //grid.jtable('reload');
        return;
      }
    }
    $.ajax({
      type: "post",
      url: '/option',
      data: {
        type: 'elements',
        data: element['type']
      },
      success: (opt)=> {
        if (scale)  opt['scale'] = scale;
        var data = {
          object: {
            element: element,
            opt: opt,
            old: {}
          }
        };

        if (scale) data['scale'] = scale;
        for (var i in opt['props']) {
          var index = opt['props'][i].key;
          data['object'].old[index] = element.attr(index);
        }
        this.setState(data);
        grid.jtable({
          actions: {
            listAction: () => {
              return {
                "Result": "OK",
                "Records": this.state['object'].opt['props'],
                "TotalRecordCount": this.state['object'].opt['props'].length
              }
            }
          },
          fields: {
            name: {
              width: '45%',
              display: (data) => {
                return this.context['lang'].elements[this['state'].object['element'].type].props[data['record'].key];
              },
            },
            type: {
              width: '45%',
              display: (data) => {
                //console.log(data);
                var value = this['state'].object['element'].attr(data['record'].key);
                //console.log(value);
                if (!value) return '';
                switch (data['record'].type) {
                  case 'color':
                    return '<div style=\" height: 100%; background: ' + value + '\"></div>';
                  case 'number':
                    //console.log(data['record']);
                    return '<input type="number" value="' + (this.state['scale'] * value).toFixed(2) + '" readonly />';
                  case 'combobox':
                    return '<input value="' + this.context['lang'].elements[this['state'].object['element'].type].props[value] + '" readonly />';
                  default:
                    return '<input value="' + value + '" readonly />';
                }
              }
            },
            edit: {
              width: '10%',
              display: (data) => {
                return $('<span class="edit-btn"/>').click(() => {
                  this.setState({ record: data['record'] });
                })[0];
              }
            }
          }
        });
        //grid.jtable('load');
        this.setState({reload: true});
      }
    });
  },
  contextTypes: {lang: React['PropTypes'].object['isRequired']}
});
export default BTIAppElementDialog;