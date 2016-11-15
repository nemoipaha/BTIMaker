import React from 'react';
import ReactDOM from 'react-dom';
import IconButton from 'material-ui/lib/icon-button';
import FontIcon from 'material-ui/lib/font-icon';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

const style = {
  width: '400',
  minHeight: '300'
};

var BTITabBar = React.createClass({
  getInitialState: function () {
    this.tabs = [];
    return {
      items: {},
      dlgOpen: false
    };
  },
  contextTypes: {
    lang: React.PropTypes.object.isRequired,
    user: React.PropTypes.object
  },
  getTabName: function(id) {
    var name = null;
    this.tabs.forEach((el) => el.id == id ? name = el.name : null);
    return name;
  },
  getTabs: function() { return this.tabs; },
  removeAll: function() {
    this.tabs.forEach((tab, i) => {
      // this.removeTab(i) не работает из-за смещения индексов в ul при удалении елемента
      this.removeTab('last');
    });
    this.tabs = [];
  },
  setTabName: function(index, name) {
    this.tabs[index].name = name;
    $('> ul > li:eq(' + index + ') > a:first', this.refs['tab-navigation-container'])
      .text(name);
  },
  setUserData: function (id, data) {
    if (!($("ul li a[href='#" + id + "']", this.refs['tab-navigation-container']).length)) return false;
    this.state.items[id] = data;
    return true;
  },
  getUserData: function (id) {
    return this.state.items[id];
  },
  getItemHTML: function (id) {
    var container = $('>[bui-tab="' + id + '"]', this.refs['tabs-container']);
    if (!container.length) return null;
    return container.get(0);
  },
  numberTab: function (index) {
    var container = $("> ul", this.refs['tab-navigation-container']),
      element = $(" li.current", container);
    if (index === 'next') {
      if (element.length < 1 || element.next().length < 1) return false;
      index = parseInt(element.next().index());
    } else if (index === 'prev') {
      if (element.length < 1 || element.prev().length < 1) return false;
      index = parseInt(element.prev().index());
    } else if (index === 'first' && (element = $(" li:first", container)).length > 0) {
      index = parseInt(element.index());
    } else if (index === 'last' && (element = $(" li:last", container)).length > 0) {
      index = parseInt(element.index());
    } else if (typeof index !== 'number' && (element = $(" li > a[href = '#" + index + "']'", container)).length > 0) {
      index = parseInt(element.parent().index());
    }
    return index;
  },
  selectTab: function (index) {
    if (!this.isMounted()) return false;
    var container = $("> ul", this.refs['tab-navigation-container']),
      index = ((typeof index === 'number') ? index : this.numberTab(index)),
      element = $("li:eq(" + index + ")", container);
    if (!element.length) return false;
    if (element.hasClass('current')) return true;
    $("li.current", container).removeClass('current');
    element.addClass('current');
    var id = $("a:first", element).attr('href').substr(1);
    container = $("> ul", this.refs['tab-modal-navigation']);
    element = $('>[bui-tab="' + id + '"]', container);
    if (!element.hasClass('current')) {
      $("li.current", container).removeClass('current');
      element.addClass('current');
    }
    $(">:visible", this.refs['tabs-container']).hide();
    $('>[bui-tab="' + id + '"]', this.refs['tabs-container']).show();
    this.setVisibleSelectedTab();
    $(this.refs['container']).triggerHandler('resize');
    if (this.props['onSelectTab']) this.props['onSelectTab'](id);
    return true;
  },
  setVisibleSelectedTab: function () {
    var container = $("ul", this.refs['tab-navigation-container']),
      element = $("li.current", container);
    if (element.length > 0) {
      var sl = parseInt(container.parent().scrollLeft());
      var x = parseInt(element.offset().left) - parseInt($("li:first", container).offset().left);
      var w = parseInt(element.outerWidth(true));
      var dw = parseInt(container.parent().innerWidth());
      if (x < sl) container.parent().scrollLeft(x);
      else if (x - sl + w > dw) container.parent().scrollLeft(x + w - dw);
    }
  },
  isTab: function (id) {
    if (!this.isMounted()) return false;
    return $("> ul li > a[href='#" + id + "']", this.refs['tab-navigation-container']).length > 0;
  },
  removeTab: function (index) {
    if (!this.isMounted()) {
      console.log('!tab isMounted');
      return false;
    }
    if (typeof index !== 'number') index = this.numberTab(index);
    var container = $("> ul", this.refs['tab-navigation-container']),
      navigation = $("> li:eq(" + index + ")", container);
    if (!navigation.length) {
      //console.log('!navigation.length');
      return false;
    }
    var element = $(">[bui-tab='" + $("a:first", navigation).attr('href').substr(1) + "']", this.refs['tabs-container']);
    if (!element.length) {
      //console.log('!element.length');
      return false;
    }
    element.remove();
    if (navigation.next().length > 0) this.selectTab(index + 1);
    else if (navigation.prev().length > 0) this.selectTab(index - 1);
    navigation.remove();
    container = $("> ul", this.refs['tab-modal-navigation']);
    navigation = $("li:eq(" + index + ")", container);
    navigation.remove();
    if (this.props['removeTab']) this.props.removeTab();
    return true;
  },
  addTab: function (tabOpt, paperOpt) {
    if (!this.isMounted()) return false;
    this.tabs.push({
      id: tabOpt.id,
      name: tabOpt.name,
      remove: tabOpt.remove,
    });
    var element = $("<li></li>"),
      parent = this,
      onclick = function () {
        parent.selectTab($(this).index());
        return false;
      }, onremove = function () {
        if ($("> ul > li", parent.refs['tab-navigation-container']).length === 1) {
          return false;
        }
        parent.setState({ dlgOpen: true, tabIndex: $(this).parents("li").index() });
        //parent.removeTab($(this).parents("li").index());
        return false;
      };

    element.append("<a href='#" + tabOpt['id'] + "'>" + tabOpt['name'] + "</a><a href='#'></a>")
      .click(onclick);
    $("> ul", parent.refs['tab-modal-navigation'])
      .append($("<li bui-tab='" + tabOpt['id'] + "'>" + tabOpt['name'] + "</li>")
        .click(onclick));
    $("> ul", parent.refs['tab-navigation-container']).append(element);
    $(parent.refs['tabs-container']).append($("<div bui-tab='" + tabOpt['id'] + "'></div>"));
    if (tabOpt['remove']) {
      $("> a:last", element).click(onremove);
    }
    else {
      $(" > a:last", element).hide();
    }
    this.props.onAddTab(tabOpt['id'], paperOpt);
    this.selectTab('last');
    return true;
  },
  componentDidMount: function () {
    $(this.refs['tab-modal-navigation']).hide();
  },
  dlgClose: function () {
    this.setState({ dlgOpen: false });
  },
  onRemove: function () {
    this.removeTab(this.state.tabIndex);
    this.tabs.splice(this.state.tabIndex, 1);
    this.dlgClose();
  },
  render: function () {
    const dlgActions = [
      <FlatButton
        label= { this.props.lang.cancelBtnText }
        secondary={true}
        keyboardFocused={true}
        onTouchTap={ this.dlgClose }
      />,
      <FlatButton
        label="OK"
        primary={true}
        keyboardFocused={true}
        onTouchTap={ this.onRemove }
      />
    ];

    return (
      <div ref='container' className='tabs'>
        <div ref='tab-navigation' className='tab-navigation'>
          <div ref='tab-navigation-tools' className='tab-navigation-tools'>
            <IconButton onClick={()=>{
                                this.selectTab('prev');
                                return false;
                            }}>
              <FontIcon className='fa fa-caret-left fa-lg'/>
            </IconButton>
            <IconButton onClick={()=>{
                                this.selectTab('next');
                                return false;
                            }}>
              <FontIcon className='fa fa-caret-right fa-lg'/>
            </IconButton>
            <IconButton onClick={()=>{
                                $(this.refs['tab-modal-navigation']).animate({
                                    height: "toggle",
                                    opacity: "toggle"
                                }, "slow"
                            );
                            }} ref='modal-button'>
              <FontIcon className='fa fa-sort-amount-asc'/>
            </IconButton>
          </div>
          <div ref='tab-navigation-container' className='tab-navigation-container'>
            <ul>
            </ul>
          </div>
          <div ref='tab-modal-navigation' className='tab-modal-navigation'>
            <ul>
            </ul>
          </div>
        </div>
        <div ref='tabs-container' className='tabs-container'>
        </div>
        <Dialog
          title = { this.props.lang.delText }
          actions = { dlgActions }
          open = { this.state.dlgOpen }
          autoScrollBodyContent = { true }
          modal = { true }
          contentStyle = { style } >
        </Dialog>
      </div>
    );
  }
});

export default BTITabBar;