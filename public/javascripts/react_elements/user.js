import Cookie from './cookie';

export default class User {
  constructor(props) {
    var cookie = this.getUserCookie();
    this.user = cookie ? JSON.parse(cookie.substr(2)) : null;
    //console.log(this.user, cookie);
  }

  getUserData() { return this.user ? this.user : null; }

  getUserCookie() {
    return Cookie.getCookie('user');
  }
}