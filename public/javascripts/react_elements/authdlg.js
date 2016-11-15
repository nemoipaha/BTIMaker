import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import Validator from 'validator';
import Checkbox from 'material-ui/lib/checkbox';
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
    marginTop: "25px"
  }
};

export default class AuthDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: this.props.lang.authTitle,
      open: false,
      error: ''
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.getOpt = this.getOpt.bind(this);
    this.validEmail = this.validEmail.bind(this);
    this.validPass = this.validPass.bind(this);
    this.onAuth = this.onAuth.bind(this);
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
    this.setState({ error: '' });
  }

  handleRememberMeCheck(event, isChecked) {
    this.setState({ stayLogin: isChecked });
  }

  handleOpen() {
    this.setState({ open: true });
  };

  handleClose() {
    this.setState({
      open: false,
      error: false,
      stayLogin: false
    });
  };

  isEmptyFields(fields) {
    var res = false;

    fields.forEach(function (item, i) {
      if (!item) { res = true; }
    });

    return res;
  }

  onAuth() {
    // проверка на пустые поля формы
    if (this.isEmptyFields([this.email, this.password])) {
      this.setState({ error: this.props.lang.emptyFormText });
      return;
    }

    if (!this.validEmail(null, this.email)) {
      //console.log('! email');
      return;
    }

    if (!this.validPass(null, this.password)) {
      //console.log('! pass');
      return;
    }

    this.userAuth(this.email, this.password);
  }

  userAuth(email, pass) {
    $.ajax({
      url: '/user/login',
      type: "post",
      dataType: "json",
      data: { username: email, password: pass, isAuth: true, stayLogin: this.state.stayLogin },
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
        onTouchTap={ this.onAuth }
      />,
    ];

    return (
      <div>
        <Dialog
          autoScrollBodyContent={true}
          title={ this.props.lang.authTitle }
          actions={actions}
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
              style={ styles.textField }
              onBlur={ this.validEmail }
              onFocus={ this.focus.bind(this) }
            />
            <br/>
            <div style={ styles.icon }><i className="fa fa-lock fa-2x" /></div>
            <TextField
              floatingLabelText={ this.props.lang.passText }
              type="password"
              style={ styles.textField }
              onBlur={ this.validPass }
              onFocus={ this.focus.bind(this) }
            />
            <br/>
            <div style={ styles.check }>
              <Checkbox
                onCheck={ this.handleRememberMeCheck.bind(this) }
                label={ this.props.lang.rememberMeText }
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}