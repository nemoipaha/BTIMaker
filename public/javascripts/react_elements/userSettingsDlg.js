import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Checkbox from 'material-ui/lib/checkbox';
import IconButton from 'material-ui/lib/icon-button';
import ClearIcon from 'material-ui/lib/svg-icons/action/delete';
import AutoComplete from 'material-ui/lib/auto-complete';
import RaisedButton from 'material-ui/lib/raised-button';
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import TableFooter from 'material-ui/lib/table/table-footer';

const style = {
  minWidth: 1000,
  minHeight: 400,
  iconButton: {
    //float: 'right',
    marginRight: '15px'
  },
  table: {
    border: 'none',
    fontSize: '16px',
  },
  tableHeaderFirst: {
    fontSize: '16px',
    color: 'red',
    width: '70%'
  },
  tableHeader: {
    fontSize: '16px',
    color: 'red',
  },
  tableFirstBody: {
    fontSize: '16px',
    width: '70%'
  },
  tableBody: {
    fontSize: '16px',
  },
  div: {
    marginBottom: '15px'
  },
  label: {
    cursor: 'pointer',
    fontSize: '16px',
    width: '40%',
    overflow: 'hidden',
    verticalAlign: 'top',
    display: 'inline-block',
    lineHeight: '48px',
    marginRight: '25px'
  },
  btn: {
    marginRight: '15px'
  },
  search: {
    padding: '2px 8px',
  },
  checkAll: {
    maxWidth: '150px',
    fontSize: '16px',
    marginLeft: '17px',
    verticalAlign: 'middle',
    display: 'inline-block'
  },
  check: {
    display: 'inline-block',
    marginLeft: '17px',
    width: '35px',
    marginRight: '15px',
    marginTop: '10px'
  },
  container: {
    //minHeight: '400px',
  },
  listItem: {
    padding: '0px'
  },
  divProjectsList: {
    width: '35%',
    maxWidth: '300px',
    verticalAlign: 'top',
    border: 'solid 1px #d9d9d9',
    display: 'inline-block'
  },
  divPropsTable: {
    verticalAlign: 'top',
    marginLeft: '5%',
    display: 'inline-block',
    width: '60%',
    border: 'solid 1px #d9d9d9'
  }
};

export default class UserSettingsDlg extends React.Component {

  constructor(props, context) {
    super(props);

    this.state = {
      open: false,
      dataSource: [],
      tableData: [],
      currentInd: null,
      checkAll: false,
      projs: []
    };

    this.changeSearchData = this.changeSearchData.bind(this);
    this.selectedProjectsIndexes = [];
    this.deleteAll = false;
  }

  open() {
    if (this.context.user.projects.length) {
      var searchData = [];
      this.context.user.projects.forEach((item) => {
        searchData.push(item.name);
      });
      this.setState({ dataSource: searchData });
    }
    this.setState({ open: true });
  }

  changeSearchData() {
    var searchData = [];
  }

  componentDidUpdate(state, props, context) {
    //console.log(state, props, context);
    //this.changeSearchData();
  }

  getTableData(projectId) {
    var tableData = [];
    if (!this.context.user.projects.length) return [];
    var projects = this.context.user.projects[projectId];
    Object.keys(projects.options).forEach((optionKey) => {
      var value = projects.options[optionKey] ? projects.options[optionKey] : null;
      var name = optionKey;
      if (value) tableData.push({ name: name, value: value.toString() });
    });
    return tableData;
  }

  componentDidMount() {
    if (this.context.user.projects.length) {
      var searchData = [];
      this.context.user.projects.forEach((item) => {
        searchData.push(item.name);
      });
      this.setState({ dataSource: searchData, projs: this.context.user.projects });
    }
  }

  close() {
    this.setState({ open: false, tableData: [], currentInd: null });
  }

  handleSearch(text, id) {
    this.selectItem(id);
    this.setState({ tableData: this.getTableData(id), currentInd: id });
  }

  deleteItem(id) {
    console.log(id);
    return;
    var data = null;
    if (id) {
      data = { projectId: id };
    }
    if (id instanceof Array && id.length) {
      data = { indexes: this.selectedProjectsIndexes };
    }
    if (this.deleteAll) data = { deleteAll: true };
    console.log(data);
    $.ajax({
      url: '/user/projects/delete',
      type: 'post',
      data: data,
      success: (postData) => {
        console.log(postData);
        if (postData.success) {
          console.log(postData.user);
          this.props.updateUser(postData.user);
            //this.updateInfo(data);
        }
      },
      error: (error) => {
        alert(error);
        console.error(error);
      }
    });
  }

  updateInfo(settings) {
    if (settings.deleteAll) {
      console.log(111);
      this.setState({ tableData: [], dataSource: [], currentInd: null, projs: [] });
    }
    if (settings.projectId) {
      var i = this.getProjectIndex(settings.projectId);
      //console.log(this.getProjectIndex(settings.projectId), this.context.user.projects);
      //var projs = this.state.projs;
      //projs.splice(i, 1);
      //if (!projs.length) {
      //  this.setState({ tableData: [], currentInd: null, projs: [] });
      //  return;
      //}
      //this.setState({ projs: projs });
      if (!this.state.currentInd && this.state.currentInd !== 0) {
        return;
      }
      console.log(this.state.currentInd, this.getProjectIndex(settings.projectId));
      if (this.state.currentInd === this.getProjectIndex(settings.projectId)) {
        // prev element
        console.log('del current', this.state.currentInd);
        var i = this.context.user.projects.indexOf(this.state.currentInd - 1);
        if (!i && i !== false) {
          console.log('aaa');
          return;
        }
        else if (i < 0) i = 0;
        console.log(i, this.state.currentInd);
        this.selectItem(i);
        this.setState({ tableData: this.getTableData(i), currentInd: i });
      }
    }
    if (settings.projects) {
      console.log(333);
      //var projects = this.context.user.projects;
      //settings.projects.forEach((ind) => {
      //  projects.splice(ind, 1);
      //});
      //console.log(projects);
      if (!this.context.user.projects.length) {
        this.setState({ tableData: [], currentInd: null, projs: [] });
        return;
      }
      //this.setState({ projs: projects });
      var i = Math.min.apply(null, this.selectedProjectsIndexes) - 1;
      if (!i) {
        console.log('aaa');
        return;
      } else if (i < 0) i = 0;
      this.selectItem(i);
      this.setState({ tableData: this.getProjectIndex(i), currentInd: i });
    }
  }

  getProjects() {
    var p = [];
    this.context.user.projects.forEach((item, i) => {
      if (this.selectedProjectsIndexes.indexOf(i)) p.push(item);
    });
    return p;
  }

  getProjectIndex(id) {
    console.log(id);
    var ind = null;
    this.state.projs.forEach((project, i) => {
      console.log(project._id);
      if (id === project._id) {
        console.log('eee');
        ind = i;
      }
    });
    return ind;
  }

  onDelClick() {
    if (!this.selectedProjectsIndexes.length && !this.deleteAll) {
      return;
    }
    this.deleteItem(this.selectedProjectsIndexes);
  }

  onCheckAll(e, checked) {
    this.selectedProjectsIndexes = [];
    this.state.projs.forEach((item, i) => {
      this.refs['check' + i].setState({ checked: checked });
      if (checked) this.selectedProjectsIndexes.push(i);
    });
    this.deleteAll = checked;
    this.setState({ checkAll: checked });
  }

  selectItem(index) {
    $('> div', this.refs.list).removeClass('item-selected');
    $('#item' + index, this.refs.list).addClass('item-selected');
  }

  onItemSelect(event) {
    var val = $(event.target).attr('data');
    if (!val) {
      return;
    }
    if (val == this.state.currentInd) {
      return;
    }
    this.selectItem(val);
    this.setState({ tableData: this.getTableData(parseInt(val)), currentInd: val });
    return false;
  }

  onItemCheck(event, checked) {
    var i = this.selectedProjectsIndexes.indexOf(parseInt(event.target.value));
    if (checked && i === -1) {
      this.selectedProjectsIndexes.push(parseInt(event.target.value));
    } else if (i !== false) {
      this.selectedProjectsIndexes.splice(i, 1);
    }
    this.refs['check' + event.target.value].setState({ checked: checked });
    if (this.state.checkAll) {
      this.deleteAll = false;
      this.setState({ checkAll: false });
    }
  }

  render() {
    const actions = [
      <RaisedButton
        label="OK"
        primary={true}
        onTouchTap={ this.close.bind(this) }
      />,
    ];

    return (
      <Dialog
        title = { this.props.lang.title }
        actions = { actions }
        open = { this.state.open }
        autoScrollBodyContent = { true }
        onRequestClose = { this.close.bind(this) }
        contentStyle = { style }
        autoDetectWindowHeight = { false } >
        <div style={ style.container }>
          { this.context.user.projects.length ?
            <div style={ style.divProjectsList }>
              <div style={ style.div }>
                <AutoComplete
                  style={ style.search }
                  hintText={ this.props.lang.searchText }
                  dataSource={this.state.dataSource}
                  onNewRequest={ this.handleSearch.bind(this) }
                  fullWidth={ false }
                />
              </div>
              <div style={ style.div }>
                <Checkbox
                  ref="checkAll"
                  style = { style.checkAll }
                  onCheck={ this.onCheckAll.bind(this) }
                  label={ this.props.lang.deleteAll }
                  checked={ this.state.checkAll }
                />
                <RaisedButton label={ this.props.lang.delete }
                              secondary={true} style={style.btn} />
              </div>
              <div style={ style.div }>
                <div className="my-list" ref="list">
                  { this.context.user.projects.map((item, i) => {
                    return (
                      <div id={ 'item' + i } key={ i }>
                        <Check
                          ref={ "check" + i }
                          onCheck={ this.onItemCheck.bind(this) }
                          value={ i + '' }
                        />
                        <div data={ i } style={ style.label }
                             onClick={ this.onItemSelect.bind(this) }>
                          { item.name }
                        </div>
                        <IconButton style={ style.iconButton }>
                          <ClearIcon /></IconButton>
                      </div>
                    );
                  }) }
                </div>
              </div>
            </div> : '' }
          { this.state.currentInd != null ?
            <div style={ style.divPropsTable }>
              <Table
                selectable={ false }
              >
                <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableHeaderColumn style={ style.tableHeaderFirst }>{ this.props.lang.nameCol }</TableHeaderColumn>
                    <TableHeaderColumn style={ style.tableHeader }>{ this.props.lang.valCol }</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} style={ style.tableBody }>
                  { this.state.tableData.map((row, index) => {
                    if (row.value === 'true') {
                      row.value = '+';
                    }
                    if (row.value === 'false') {
                      row.value = '-';
                    }
                    var name = this.context.lang.paperOptions[row.name];
                    return (
                      <TableRow key={index} selected={row.selected}>
                        <TableRowColumn style={ style.tableFirstBody }>
                          { name }
                        </TableRowColumn>
                        <TableRowColumn style={ style.tableBody }>
                          { row.value }
                        </TableRowColumn>
                      </TableRow>
                    );
                  }) }
                </TableBody>
              </Table>
            </div> : '' }
        </div>
      </Dialog>
    );
  }
}

class Check extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      checked: false
    };
  }

  render() {
    return (
      <Checkbox
        onCheck={ this.props.onCheck }
        value={ this.props.value }
        ref="check"
        checked={ this.state.checked }
        style={ style.check }
      />
    );
  }
}

UserSettingsDlg.contextTypes = {
  lang: React.PropTypes.object.isRequired,
  user: React.PropTypes.object
};

/*
*
* <IconButton style={ style.iconButton }
 onTouchTap={ () => this.deleteItem(item._id) }>
 <ClearIcon /></IconButton>*/
/*
 <RaisedButton label={ this.props.lang.delete }
 onTouchTap={ this.onDelClick.bind(this) }
 secondary={true} style={style.btn} />

 */