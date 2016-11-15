import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

import React from 'react';
import ReactDOM from 'react-dom';
import Color from "material-ui/lib/styles/colors";
import IconMenu from 'material-ui/lib/menus/icon-menu';
import IconButton from 'material-ui/lib/icon-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui/lib/toolbar';
import RegDlg from "./regdlg";
import AuthDlg from "./authdlg";
import NewTabDlg from './newtabdlg';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import HomeIcon from 'material-ui/lib/svg-icons/action/home';
import UserSettingsDlg from './userSettingsDlg';
import SaveDlg from './saveDlg';

const styles = {
  langMenu: {
    cursor: 'pointer',
    maxWidth: '25%',
    menuItem: {
      minWidth: '200px'
    }
  },
  userMenu: {
    menuItem: {
      minWidth: '150'
    },
    btn: {
      maxWidth: '100%'
    }
  },
  homeBtn: {
    verticalAlign: "middle",
    marginTop: '-5px',
    maxWidth: '25%',
  },
  img: {
    width: "32px",
    verticalAlign: "middle",
    height: "24px"
  },
  icons: {
    fontSize: "18px",
    //border: "1px solid green",
  },
  toolbarGroup: {
    width: "25%",
    borderRight: "1px solid rgba(0, 0, 0, .175)",
  },
  lastToolbarGroup: {
    width: "25%",
    textAlign: 'right',
  },
  btn: {
    maxWidth: '25%',
    //border: "1px solid #000",
  },
  userLabel: {
    maxWidth: '50%',
    overflow: 'hidden',
    display: 'inline-flex'
  }
};

export default class ToolbarExamplesSimple extends React.Component {

  constructor(props) {
    super(props);

    this.user = props.user ? props.user : null;
    this.onAuth = this.onAuth.bind(this);
    this.onReg = this.onReg.bind(this);
    this.menuBtnClick = this.menuBtnClick.bind(this);

    var options = this.getToolbarItems({url: '/option', data: {type: 'app', data: 'toolbar'}});

    this.state = $.extend(options, { user: this.user});
  }

  getToolbarItems(params) {
    var opt = {};
    var par = this;

    $.ajax({
      type: "post",
      url: params.url,
      async: false,
      dataType: "json",
      data: params.data,
      success: function (data) {
        opt = data;
        if (data) par.options = data;
      },
      error: function (xhr, ajaxOptions, thrownError) {
        alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });

    return opt;
  }

  componentDidMount() {
    $(' > div > span', ReactDOM.findDOMNode(this.refs.viewModeBtn)).addClass('btn-select');
  }

  onAuth() {
    this.refs.authDlg.handleOpen();
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this._container);
  }

  onReg() {
    this.refs.regDlg.handleOpen();
  }

  changeLocale(event, value) {
    this.setState({langMenuIcon: 'images/lang/' + value + '.png'});
    this.props.changeLocale(value);
    //console.log(event, value);
  }

  menuBtnClick(e) {
    this.props.openLeftMenu(e);
  }

  handleNewTab() {
    this.refs.newTabDlg.handleOpen();
  }

  userLogin(user) {
    this.props.userLogin(user);
    //this.setState({ user: user });
  }

  userSettings() {
    this.refs.userSettingsDlg.open();
  }

  userLogout() {
    this.props.userLogout();
  }

  onSave() {
    this.props.user ? this.refs.saveDlg.open() : this.refs.authDlg.handleOpen();
  }

  toggleGrid() {
    $('> div > span', ReactDOM.findDOMNode(this.refs.gridBtn)).toggleClass('btn-select');
    this.props.toggleGrid();
  }

  viewMode() {
    $(' > div > span', ReactDOM.findDOMNode(this.refs.drawModeBtn)).removeClass('btn-select');
    $(' > div > span', ReactDOM.findDOMNode(this.refs.viewModeBtn)).addClass('btn-select');
    this.props.viewMode();
  }

  drawMode() {
    $(' > div > span', ReactDOM.findDOMNode(this.refs.viewModeBtn)).removeClass('btn-select');
    $(' > div > span', ReactDOM.findDOMNode(this.refs.drawModeBtn)).addClass('btn-select');
    this.props.drawMode();
  }

  render() {
    return (
      <Toolbar className="bti-toolbar" style={ styles.style }>
        <ToolbarGroup firstChild={true} style={ styles.toolbarGroup }>
          <IconButton
            style={ styles.btn }
            onClick={ this.menuBtnClick }
            touch={ true }
            tooltip={ this.props.lang.buttons.menu.title }
            iconClassName="fa fa-navicon"
            iconStyle={ styles.icons }
            tooltipPosition="bottom-right"
          />
          <FloatingActionButton
            href="/"
            mini={ true }
            style={ styles.homeBtn }
            secondary={ true }
            linkButton={ true }>
            <HomeIcon />
          </FloatingActionButton>
        </ToolbarGroup>
        <ToolbarGroup style={ styles.toolbarGroup }>
          <IconButton
            style={ styles.btn }
            touch={true}
            iconStyle={ styles.icons }
            iconClassName="fa fa-save fa-lg"
            onTouchTap={ this.onSave.bind(this) }
            tooltip={ this.props.lang.buttons.save.title }
            tooltipPosition="bottom-right"
          />
          <IconButton
            style={ styles.btn }
            onTouchTap={ this.handleNewTab.bind(this) }
            touch={ true }
            iconStyle={ styles.icons }
            iconClassName="fa fa-pencil-square-o fa-lg"
            tooltip={ this.props.lang.buttons.newLayout.title }
            tooltipPosition="bottom-right"
          />
          <IconButton
            ref="viewModeBtn"
            style={ styles.btn }
            touch={true}
            iconStyle={ styles.icons }
            iconClassName="fa fa-mouse-pointer fa-lg"
            tooltip={ this.props.lang.buttons.chooseObject.title }
            tooltipPosition="bottom-right"
            onClick={ this.viewMode.bind(this) }
          />
          <IconButton
            ref="drawModeBtn"
            style={ styles.btn }
            touch={true}
            iconStyle={ styles.icons }
            iconClassName="fa fa-paint-brush fa-lg"
            tooltip={ this.props.lang.buttons.drawWall.title }
            onClick={ this.drawMode.bind(this) }
            tooltipPosition="bottom-right"
          />
        </ToolbarGroup>
        <ToolbarGroup style={ styles.toolbarGroup }>
          <IconButton
            style={ styles.btn }
            onClick={() => {
                if(typeof this['props'].scaleClick == 'function')
                this['props'].scaleClick(true);
            }}
            touch={true}
            iconStyle={ styles.icons }
            iconClassName="fa fa-plus fa-lg"
            tooltip={ this.props.lang.buttons.incGrid.title }
            tooltipPosition="bottom-right"
          />
          <IconButton
            style={ styles.btn }
            onClick={()=>{
                if(typeof this['props'].scaleClick == 'function')
                this['props'].scaleClick(false);
            }}
            touch={ true }
            iconStyle={ styles.icons }
            iconClassName="fa fa-minus fa-lg"
            tooltip={ this.props.lang.buttons.decGrid.title }
            tooltipPosition="bottom-right"
          />
          <IconButton
            ref="gridBtn"
            style={ styles.btn }
            onClick={ this.toggleGrid.bind(this) }
            touch={ true }
            iconStyle={ styles.icons }
            iconClassName="fa fa-table fa-lg"
            tooltip={ this.props.lang.buttons.showGrid.title }
            tooltipPosition="bottom-right"
          />
        </ToolbarGroup>
        <ToolbarGroup float="right" style={ styles.lastToolbarGroup }>
          <span style={ styles.userLabel }>{ this.props.user ? this.props.user.username : '' }</span>
          <IconMenu
            style={ styles.btn }
            iconButtonElement={
            <IconButton style={ styles.userMenu.btn } iconStyle={ styles.icons } iconClassName="fa fa-user fa-lg" />
          }
            anchorOrigin={ { horizontal: 'middle', vertical: 'bottom' } }
            targetOrigin={ { horizontal: 'right', vertical: 'top' } }
          >
            {
              this.props.user ? this.options.buttons.userMenu.userItems.map((el, i) => {
                var text = '', click = null;

                switch (el.id) {
                  case 'settings':
                    text = this.props.lang.buttons.userMenu.userSettingsText;
                    click = this.userSettings.bind(this);
                    break;
                  case 'logout':
                    text = this.props.lang.buttons.userMenu.userLogoutText;
                    click = this.userLogout.bind(this);
                    break;
                }

                return (
                  <MenuItem key={ i } primaryText={ text } onClick={ click }/>
                );
              })
                :
                this.options.buttons.userMenu.defaultItems.map((el, i) => {
                  var text = '', click = null;

                  switch (el.id) {
                    case 'login':
                      text = this.props.lang.buttons.userMenu.userLoginText;
                      click = this.onAuth.bind(this);
                      break;
                    case 'registration':
                      text = this.props.lang.buttons.userMenu.userRegText;
                      click = this.onReg.bind(this);
                      break;
                  }

                  return (
                    <MenuItem key={ i } primaryText={ text } onClick={ click }/>
                  );
                })
            }
          </IconMenu>
          <IconMenu
            style={ styles.langMenu }
            onChange={ this.changeLocale.bind(this) }
            iconButtonElement={
            <div>
              <img style={ styles.img }
                src={ this.state.langMenuIcon }
                alt={  this.props.lang.buttons.changeLangMenu.title } />
            </div>
          }
            anchorOrigin={ { horizontal: 'middle', vertical: 'bottom' } }
            targetOrigin={ { horizontal: 'right', vertical: 'top' } }
          >
            {
              this.options.buttons.changeLanguageMenu.items.map((el, i) => {
                return <MenuItem style={ styles.langMenu.menuItem }
                  leftIcon={ <img style={ styles.img } src={ el.img } alt={ this.props.lang.buttons.changeLangMenu[el.id + 'Text'] }/> }
                  key={ i }
                  primaryText={ this.props.lang.buttons.changeLangMenu[el.id + 'Text'] }
                  value={ el.id }>
                </MenuItem>;
              })
            }
          </IconMenu>

          <RegDlg lang={ this.props.lang.authRegDlg } ref="regDlg" userLogin={ this.userLogin.bind(this) }/>
          <AuthDlg lang={ this.props.lang.authRegDlg } ref="authDlg" userLogin={ this.userLogin.bind(this) }/>
          <NewTabDlg lang={ this.props.lang.newTabDlg } ref="newTabDlg" addTab={ this.props.addTab }/>
          { this.props.user ?
            <div>
              <UserSettingsDlg lang={ this.props.lang.userSettingsDlg } updateUser={ this.props.updateUser } ref="userSettingsDlg"/>
              <SaveDlg lang = {this.props.lang.saveDlg } ref="saveDlg" saveUserData={ this.props.saveUserData } />
            </div>
              : '' }
        </ToolbarGroup>
      </Toolbar>
    );
  }
}
