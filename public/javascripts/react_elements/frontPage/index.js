import React from 'react';
import ReactDOM from 'react-dom';
import Footer from './footer';
import Header from './header';
import Content from './content';
import RegDlg from "../regdlg";
import AuthDlg from "../authdlg";
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

export default class FrontPage extends React.Component {
  constructor(props, context) {
    super(props);
    this.langArr = [];
    this.state = {
      lang: {
        authRegDlg: {},
        langMenu: {}
      },
      user: null
    };
    this.langId = 'ru';
  }

  componentDidMount() {
    this.getLanguage(this.langId, 'frontPage');
    this.getUser();
  }

  getUser() {
    $.ajax({
      type: "post",
      url: "/user",
      success: (data) => {
        if (data.user) this.setState({ user: data.user });
        //console.log(data);
      },
      error: function (err) {
        console.error(err);
      }
    });
  }

  getLanguage(lang, type) {
    $.ajax({
      type: "post",
      url: '/language/' + lang + '/frontPage',
      success: (data) => {
        //console.log(data);
        if (data.error) {
          console.error(error); return;
        }
        this.setState({ lang: data });
        this.langId = lang;
        this.langArr.push({ id: lang, strings: data });
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.error(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });
  }

  changeLocale(langId) {
    if (this.langId === langId) return;
    for (var i in this.langArr) {
      if (this.langArr[i].id === langId) {
        this.setState({ lang: this.langArr[i].strings });
        return;
      }
    }
    this.getLanguage(langId, 'frontPage');
  }

  getChildContext() {
    return {
      lang: this.state.lang,
      user: this.state.user
    };
  }

  userLogin(user) {
    if (user) {
      //console.log(user);
      document.location.href = '/editor';
      //this.setState({ user: user });
    }
  }

  userAuth() {
    this.refs.authDlg.handleOpen();
  }

  userReg() {
    this.refs.regDlg.handleOpen();
  }

  userLogout() {
    $.ajax({
      url: '/logout',
      type: 'post',
      success: (data) => {
        //console.log(data);
        if (data.success) {
          this.setState({ user: null });
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  render() {
    return (
      <div>
        <Header lang={ this.state.lang }
                user={ this.state.user }
                userLogout={ this.userLogout.bind(this) }
                userAuth={ this.userAuth.bind(this) }
                userReg={ this.userReg.bind(this) }
                changeLocale={ this.changeLocale.bind(this) }/>
        <Content lang={ this.state.lang }/>
        <Footer lang={ this.state.lang }/>
        <RegDlg lang={ this.state.lang.authRegDlg } ref="regDlg" userLogin={ this.userLogin.bind(this) }/>
        <AuthDlg lang={ this.state.lang.authRegDlg } ref="authDlg" userLogin={ this.userLogin.bind(this) }/>
      </div>
    );
  }
};

FrontPage.childContextTypes = {
  lang: React.PropTypes.object,
  user: React.PropTypes.object,
};

ReactDOM.render(<FrontPage/>, document.getElementById('app-container'));
