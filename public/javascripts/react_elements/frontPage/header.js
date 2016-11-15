import React from 'react';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import IconButton from 'material-ui/lib/icon-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
const styles = {
  img: {
    width: 32,
    height: 24,
    verticalAlign: 'middle'
  },
  userMenu: {
    menuItem: {
      minWidth: '200px'
    },
  },
};

export default class Header extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      langMenuIcon: 'images/lang/ru.png'
    };
  }

  changeLocale(e, v) {
    this.setState({ langMenuIcon: 'images/lang/' + v + '.png' });
    this.props.changeLocale(v);
  }

  render() {
    return (
      <nav className="white" role="navigation">
        <div className="nav-wrapper container">
          <IconMenu
            className="user-menu"
            onChange={ this.changeLocale.bind(this) }
            iconButtonElement={
            <div>
              <img style={ styles.img }
                src={ this.state.langMenuIcon }
                alt="" />
            </div>
          }
            anchorOrigin={ { horizontal: 'middle', vertical: 'bottom' } }
            targetOrigin={ { horizontal: 'left', vertical: 'top' } }
          >
            <MenuItem
              style={ styles.userMenu.menuItem }
              leftIcon={ <img style={ styles.img } src="images/lang/ru.png" alt=""/> }
              primaryText={ this.props.lang.langMenu.ru }
              value="ru"/>
            <MenuItem
              style={ styles.userMenu.menuItem }
              leftIcon={ <img style={ styles.img } src="images/lang/en.png" alt=""/> }
              primaryText={ this.props.lang.langMenu.en }
              value="en"/>
            <MenuItem
              style={ styles.userMenu.menuItem }
              leftIcon={ <img style={ styles.img } src="images/lang/ua.png" alt=""/> }
              primaryText={ this.props.lang.langMenu.ua }
              value="ua"/>
          </IconMenu>

          <a id="logo-container" href="#" className="brand-logo"><img /></a>

          { this.props.user ?
            <div className="user-label">
              { this.props.lang.hello + ' ' + this.props.user.username }
              <ul className="right hide-on-med-and-down">
                <li><a href="#logout" onClick={ this.props.userLogout }>
                  { this.props.lang.logout }</a></li>
              </ul>
            </div>
            :
            <ul className="right hide-on-med-and-down">
              <li><a href="#auth" onClick={ this.props.userAuth }>{ this.props.lang.userAuth }</a></li>
              <li><a href="#reg" onClick={ this.props.userReg }>{ this.props.lang.userReg }</a></li>
            </ul>
          }

          <ul id="nav-mobile" className="side-nav">
            <li><a href="#">{ this.props.lang.userAuth }</a></li>
            <li><a href="#">{ this.props.lang.userReg }</a></li>
          </ul>
          <a href="#" data-activates="nav-mobile" className="button-collapse"><i className="material-icons">menu</i></a>
        </div>
      </nav>
    );
  }
}

Header.ContextTypes = {
  lang: React.PropTypes.object,
  user: React.PropTypes.object,
};