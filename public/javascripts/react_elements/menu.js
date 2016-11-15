import React from 'react';

export default class Menu extends React.Component {

  constructor(props) {
    super(props);

    this.state = { open: false };

    this.handleToggle = this.handleToggle.bind(this);
    this.createList = this.createList.bind(this);
    this.getNameByKey = this.getNameByKey.bind(this);

    this.options = this.getMenuOpt({
      url: "/option",
      data: {
        type: "app",
        data: "menu",
      }
    });

    this.items = this.createList(this.options.categories, this.props.elements);
  }

  getNameByKey(elemKey) {
    if (this.props.lang.names.hasOwnProperty(elemKey)) {
      return this.props.lang.names[elemKey];
    }
  }

  createList(cats, objects) {
    var par = this;

    // рекурсия для перебора всех категорий со вложеностями и вставка им принадлежащих объектов
    cats.forEach(function (cat, i) {

      objects.forEach(function(ob, i) {
        if (ob.categoryId == cat.id) {

          if (!cat.hasOwnProperty('subCategories')) cat.subCategories = [];

          var name = par.props.lang.names[ob.key]; //par.getNameByKey(ob.key);

          if (ob.error) {
            name += ' - ' + par.props.lang.names['error']; //par.getNameByKey('error');
          }

          ob.id = ob.key;
          ob.name = par.props.lang.names[ob.key];//name;
          cat.subCategories.push(ob);
        }
      });

      if (cat.subCategories && cat.subCategories.length)
        par.createList(cat.subCategories, objects);

    });

    return cats;
  }

  getMenuOpt(params) {
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
        alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });

    return opt;
  }

  handleToggle() {
    this.setState({ open: !this.state.open });
  }

  componentDidMount() {
    var ul = this.refs.ul;

    $(ul).hide();

    $("li", ul).click(function (event) {
      if (event.button === 2) return false;

      if ($('ul', this).length) {
        $(this).toggleClass("active");
        $("> ul", this).toggle('fast');
      }

      event.preventDefault();
      event.stopPropagation();

      return false;
    });

    var par = this;

    $("li", ul).each(function() {
      if ($('ul', this).length) return;

      $(this).draggable({
        cursor: "move",
        distance: 50,
        helper: function() {
          var img = $('img', this).attr('src');

          $(document.body)
            .append('<div class="dnd" id="dnd"><img src="' + img +  '"/></div>');

          return $('#dnd')[0];
        },

        start: (e, ui) => {
          $('#dnd').fadeIn();
          par._mouseLeave();
        },

        drag: (ev, ui) => {
          var position = {
            left: ev.pageX - $('#dnd').width() / 2,
            top: ev.pageY - $('#dnd').height() / 2
          };

          if (position.top < par.props.parentRect.top) {
            position.top = par.props.parentRect.top;
          }

          if (position.top + ui.helper.height() > par.props.parentRect.bottom) {
            position.top = par.props.parentRect.bottom - ui.helper.height();
          }

          if (position.left < par.props.parentRect.left) {
            position.left = par.props.parentRect.left;
          }

          if (position.left + ui.helper.width() > par.props.parentRect.right) {
            position.left = par.props.parentRect.right - ui.helper.width();
          }

          ui.position = position;
        },

        stop: function(e, ui) {
          $('#dnd').remove();
          var pos = { left: e.pageX, top: e.pageY };
          if ($(this).data().error) {
            var text = par.getNameByKey($(this).data().id) + ' '
             + par.props.lang.names.createObjectError;
            console.log(text);
            alert(text);
            return;
          }
          par.props.createObject($(this).data().id, pos);
        }
      });
    });

    $("li:has('> ul') > a > i", ul).addClass("fa-angle-down");

    $(ul).show();
  }

  _mouseLeave(e) {
    $(this.refs.sidebar).stop(0, 1).animate({ width: 'toggle' });
  }

  render() {
    let nodes = this.items.map((category) => {
      return (
        <Node names={ this.props.lang.names }  key={ category.id } node={ category } children={ category.subCategories } />
      );
    });

    return (
      <div className="sidebar" id="sidebar" ref="sidebar">
        <div className="menu-container">
          <div className="logo"></div>
          <ul ref="ul">
            { nodes }
          </ul>
        </div>
      </div>
    );
  }
}

class Node extends React.Component {

  componentDidMount() {
    $(this.refs.li).data({ error: this.props.node.error, id: this.props.node.id });
  }

  render() {
    let childs = null;

    // the Node component calls itself if there are children
    if (this.props.children) {
      childs = this.props.children.map((childnode) => {
        return (
          <Node names={ this.props.names } key={childnode.id} node={ childnode } children={ childnode.subCategories } />
        );
      });
    }

    return (
      <li ref="li">
        <a href={ '#' + this.props.node.id }>
          <span className='icon'>
            <img src={ this.props.node.icon } />
          </span>
          { this.props.names[this.props.node.id] }
          <i className="fa toggle"></i>
        </a>
        { childs ? <ul className="collapse">{ childs }</ul> : null }
      </li>
    );
  }
}