import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import Slider from 'material-ui/lib/slider';
import Toggle from 'material-ui/lib/toggle';
import RaisedButton from 'material-ui/lib/raised-button';

const style = {
  btn: {
    marginRight: '15px'
  },
  width: '600',
  textField: {
    marginLeft: '15'
  },
  icon: {
    verticalAlign: "middle",
    display: "inline-block"
  },
  isFixedSlider: {
    marginBottom: 28
  }
};

export default class NewTabDialog extends React.Component {

  constructor(props, context) {
    super(props);
    var opt = this.getOpt({
      url: "/option", data: {
        type: "app",
        data: "newTabDlg"
      }
    });
    var widthDefault = parseInt(opt.form.width.min) + parseInt(opt.form.width.max - opt.form.width.min) / 2;
    var heightDefault = parseInt(opt.form.height.min) + parseInt(opt.form.height.max - opt.form.height.min) / 2;
    var meshStepDefault = parseInt(opt.form['mesh-step'].min) + parseInt(opt.form['mesh-step'].max - opt.form['mesh-step'].min) / 2;
    var staticRealStepDefault = parseInt(opt.form['static-real-step'].min) + parseInt(opt.form['static-real-step'].max - opt.form['static-real-step'].min) / 2;
    this.state = $.extend(opt, {
      open: false,
      nameValue: '',
      'mesh-step': meshStepDefault,
      heightValue: heightDefault,
      widthValue: widthDefault,
      'wall-sel-min': false,
      'is-fixed': false,
      'static-real-step': staticRealStepDefault
    });
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getOpt = this.getOpt.bind(this);
  }

  getOpt(params) {
    var opt = {};
    $.ajax({
      type: "post",
      url: params.url,
      async: false,
      dataType: "json",
      data: params.data,
      success: function (data) {
        opt = data;
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });

    return opt;
  }

  handleOpen() {
    this.setState({open: true});

  };

  handleClose() {
    var widthDefault = parseInt(this.state.form.width.min) + parseInt(this.state.form.width.max - this.state.form.width.min) / 2;
    var heightDefault = parseInt(this.state.form.height.min) + parseInt(this.state.form.height.max - this.state.form.height.min) / 2;
    var meshStepDefault = parseInt(this.state.form['mesh-step'].min) + parseInt(this.state.form['mesh-step'].max - this.state.form['mesh-step'].min) / 2;
    var staticRealStepDefault = parseInt(this.state.form['static-real-step'].min) + parseInt(this.state.form['static-real-step'].max - this.state.form['static-real-step'].min) / 2;

    this.setState({
      open: false,
      'is-fixed': false,
      'mesh-step': meshStepDefault,
      heightValue: heightDefault,
      'wall-sel-min': false,
      nameValue: '',
      error: '',
      widthValue: widthDefault,
      'static-real-step': staticRealStepDefault
    });
  };

  isUniqueName(name) {
    var res = true;
    var tabs = this.context.tabs;
    tabs.forEach((item, i) => {
      if (item.name === name) {
        res = false;
      }
    });
    return res;
  }

  onAddTab(e) {
    console.log(this.state.nameValue.trim());
    if (!this.state.nameValue.trim()) {
      this.setState({ error: this.props.lang.emptyFieldErrorText });
      return;
    } else if (!this.isUniqueName(this.state.nameValue.trim())) {
      this.setState({ error: this.props.lang.uniqueNameErrorText });
      return;
    }
    this.handleClose();
    console.log(this.state['is-fixed'] ? this.state['static-real-step'] : null);
    this.props.addTab({
      name: this.state.nameValue.trim(),
      width: this.state.widthValue,
      height: this.state.heightValue,
      'wall-sel-min': this.state['wall-sel-min'],
      'is-fixed': this.state['is-fixed'],
      'mesh-step': this.state['mesh-step'],
      'static-real-step': this.state['is-fixed'] ? this.state['static-real-step'] : null
    });
  }

  handleWallSel(e) {
    this.setState({'wall-sel-min': !this.state['wall-sel-min']});
  }

  handleFixedType(e) {
    this.setState({'is-fixed': !this.state['is-fixed']});
  }

  handleHeightSlider(e, val) {
    this.setState({heightValue: val});
  }

  handleWidthSlider(e, val) {
    this.setState({widthValue: val});
  }

  handleMeshStepSlider(e, val) {
    this.setState({'mesh-step': val});
  }

  handleStaticRealStepSlider(e, val) {
    this.setState({ 'static-real-step': val });
  }

  handleNameChange(e) {
    this.setState({
      nameValue: e.target.value,
    });
  }

  handleNameFocus(e) {
    this.setState({
      error: ''
    });
  }

  render() {
    const actions = [
      <RaisedButton
        style={ style.btn }
        label={ this.props.lang.cancelBtnText }
        secondary={true}
        onTouchTap={this.handleClose}
      />,
      <RaisedButton
        label="OK"
        primary={true}
        onTouchTap={ this.onAddTab.bind(this) }
      />,
    ];

    return (
      <Dialog
        title={ this.props.lang.title }
        actions={actions}
        open={this.state.open}
        autoScrollBodyContent={true}
        onRequestClose={this.handleClose}
        contentStyle={style}>
        <div className="error-text">{this.state.error}</div>
        <div>
          <div>
            <TextField
              hintText={ this.props.lang.nameText }
              fullWidth={ false }
              onFocus={ this.handleNameFocus.bind(this) }
              onChange={ this.handleNameChange.bind(this) }
            />
          </div>
          <br />
          <span>{ this.props.lang.widthText + ' ' + this.state.widthValue }</span>
          <Slider
            min={ parseInt(this.state.form.width.min) }
            max={ parseInt(this.state.form.width.max) }
            step={ parseInt(this.state.form.width.step) }
            defaultValue={ this.state.widthValue }
            onChange={ this.handleWidthSlider.bind(this) }
          />
          <Toggle label={ this.props.lang.wallSelText } onToggle={ this.handleWallSel.bind(this) }/>
          <br /><br />
          <span>{ this.props.lang.heightText + ' ' + this.state.heightValue }</span>
          <Slider
            min={ parseInt(this.state.form.height.min) }
            max={ parseInt(this.state.form.height.max) }
            step={ parseInt(this.state.form.height.step) }
            defaultValue={ this.state.heightValue }
            onChange={ this.handleHeightSlider.bind(this) }
          />
          <span>{ this.props.lang.meshStepText + ' ' + this.state['mesh-step'] }</span>
          <Slider
            min={ parseInt(this.state.form['mesh-step'].min) }
            max={ parseInt(this.state.form['mesh-step'].max) }
            step={ parseInt(this.state.form['mesh-step'].step) }
            defaultValue={ this.state['mesh-step'] }
            onChange={ this.handleMeshStepSlider.bind(this) }
          />
          <Toggle label={ this.props.lang.isFixedText } onToggle={ this.handleFixedType.bind(this) }/>
          <Slider
            style={ style.isFixedSlider }
            disabled={ !this.state['is-fixed'] }
            min={ parseInt(this.state.form['static-real-step'].min) }
            max={ parseInt(this.state.form['static-real-step'].max) }
            step={ parseInt(this.state.form['static-real-step'].step) }
            defaultValue={ this.state['static-real-step'] }
            onChange={ this.handleStaticRealStepSlider.bind(this) }/>
          <span>{ this.state['is-fixed'] ? this.props.lang['static-real-step'] + ' ' + this.state['static-real-step'] : '' }</span>
        </div>
      </Dialog>
    );
  }
}

NewTabDialog.contextTypes = {
  lang: React.PropTypes.object.isRequired,
  user: React.PropTypes.object,
  tabs: React.PropTypes.array
};