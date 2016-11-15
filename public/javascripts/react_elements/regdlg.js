import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import Validator from 'validator';
import RaisedButton from 'material-ui/lib/raised-button';

Validator.isPass = (pass) => {
  var Regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\s\\_`\/])(?=.{6,15})/;
  return Regex.test(pass);
};

const styles = {
  btn: {
    marginRight: '15px'
  },
  width: '400',
  //maxWidth: '600',
  textField: {
    marginLeft: '15'
  },
  icon: {
    verticalAlign: "middle",
    display: "inline-block"
  },
  check: {
    marginTop: "15px"
  }
};

export default class RegDialog extends React.Component {
  constructor(props) {
    super(props);

    //var opt = this.getOpt({ url: "/option/lang", data: {
    //  type: "component_props",
    //  data: "auth-reg-dlg",
    //  lang: 'ru',
    //}});

    this.state = {
      title: this.props.lang.regTitle,
      open: false,
      error: '',
      //stayLogin: false
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getOpt = this.getOpt.bind(this);
  }

  validEmail(e, val) {
    var value = e ? e.target.value : val;
    this.email = value;
    // если кликнули по полю формы и потеряли фокус, то просто выход без проверки
    if (!value) return false;

    if (!Validator.isEmail(value + '')) {
      var error = this.props.lang.emailError;
      this.setState({ error: error });
      return false;
    }

    return true;
  }

  validPass(e, val) {
    var value = e ? e.target.value : val;
    this.password = value;
    // если кликнули по полю формы и потеряли фокус, то просто выход без проверки
    if (!value) return false;

    if (!Validator.isPass(value + '')) {
      var error = this.props.lang.passError;
      this.setState({ error: error });
      return false;
    }

    return true;
  }

  focus() {
    this.setState({ error: false });
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
      error: function(xhr, ajaxOptions, thrownError) {
        console.error(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });

    return opt;
  }

  focus() {
    this.setState({ error: '' });
  }

  handleOpen() {
    this.setState({ open: true });
  };

  handleClose() {
    this.setState({
      open: false,
      error: false,
    });
  };

  isEmptyFields(fields) {
    var res = false;

    fields.forEach(function (item, i) {
      if (!item) { res = true; }
    });

    return res;
  }

  userReg(email, pass) {
    $.ajax({
      url: '/user/login',
      type: "post",
      dataType: "json",
      data: { username: email, password: pass, isAuth: false },
      success: (data) => {
        //console.log(data);

        if (data.error) {
          this.setState({ error: this.props.lang.errText });
          return;
        }
        else if (data.user) this.props.userLogin(data.user);

        this.handleClose();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onReg() {
    if (this.isEmptyFields([this.email, this.password])) {
      this.setState({ error: this.props.lang.emptyFormText });
      return;
    }

    if (!this.validEmail(null, this.email)) return;
    if (!this.validPass(null, this.password)) return;

    this.userReg(this.email, this.password);
  }

  inputEmail(e) {
    this.email = e.target.value;
  }

  inputPassword(e) {
    this.password = e.target.value;
  }

  render() {
    const actions = [
      <RaisedButton
        style={ styles.btn }
        label={ this.props.lang.cancelBtnText ? this.props.lang.cancelBtnText : "Cancel" }
        secondary={true}
        onTouchTap={this.handleClose}
      />,
      <RaisedButton
        label="OK"
        primary={true}
        onTouchTap={ this.onReg.bind(this) }
      />,
    ];

    return (
        <Dialog
          autoScrollBodyContent={true}
          title={ this.props.lang.regTitle }
          actions={actions}
          modal={ false }
          open={this.state.open}
          contentStyle={styles}
          onRequestClose={this.handleClose}
        >
          <div className="error-text">{ this.state.error }</div>
          <div className="">
            <div style={ styles.icon }><i className="fa fa-user fa-2x" /></div>
            <TextField
              floatingLabelText={ this.props.lang.emailText }
              type="text"
              fullWidth={ false }
              style={ styles.textField }
              onBlur={ this.validEmail.bind(this) }
              onFocus={ this.focus.bind(this) }
              onChange={ this.inputEmail.bind(this) }
            />
            <br />
            <div style={ styles.icon }><i className="fa fa-lock fa-2x" /></div>
            <TextField
              floatingLabelText={ this.props.lang.passText }
              type="password"
              fullWidth={ false }
              onBlur={ this.validPass.bind(this) }
              onFocus={ this.focus.bind(this) }
              onChange={ this.inputPassword.bind(this) }
              style={ styles.textField }
            />
          </div>
        </Dialog>
    );
  }
}