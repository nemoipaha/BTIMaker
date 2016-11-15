import React from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Divider from 'material-ui/lib/divider';
import Checkbox from 'material-ui/lib/checkbox';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';

const style = {
  btn: {
    marginRight: '15px'
  },
  width: '600',
  label: {
    fontSize: '18px',
    color: 'red',
    textAlign: 'center'
  }
};

class SaveDlg extends React.Component {

  constructor(props, context) {
    super(props);
    this.state = {
      open: false,
    };
    this.tabIds = [];
  }

  open() {
    this.setState({ open: true });
  }

  close() {
    this.setState({ open: false });
    this.tabIds = [];
  }

  onCheck(event) {
    this.tabIds.push(event.target.value);
  }

  onSave() {
    if (!this.tabIds.length) {
      return this.close();
    }
    this.props.saveUserData(this.tabIds);
    this.tabIds = [];
    this.close();
  }

  render() {
    const actions = [
      <RaisedButton
        style={ style.btn }
        label={ this.props.lang.cancelBtnText }
        primary={true}
        onTouchTap={ this.close.bind(this) }
      />,
      <RaisedButton
        label="OK"
        secondary={true}
        onTouchTap={ this.onSave.bind(this) }
      />,
    ];

    return (
      <Dialog
        title = { this.props.lang.title }
        actions = { actions }
        open = { this.state.open }
        modal={ true }
        autoScrollBodyContent = { true }
        onRequestClose = { this.close.bind(this) }
        contentStyle = { style } >
        <div>
          <div style={ style.label }>{ this.props.lang.labelText }</div>
          <div>
            <List>
              {
                this.context.tabs ?
                  this.context.tabs.map((tab, i) => {
                    return (
                      <ListItem
                        leftCheckbox={ <Checkbox value={ tab.id + '' }
                          onCheck={ this.onCheck.bind(this) }/>
                        }
                        primaryText={ tab.name }
                        key={ i }
                      />
                    );
                  })
                  :
                  ''
              }
            </List>
          </div>
        </div>
      </Dialog>
    )
  }
}

SaveDlg.contextTypes = {
  lang: React.PropTypes.object.isRequired,
  user: React.PropTypes.object,
  tabs: React.PropTypes.array
};

module.exports = SaveDlg;
export default SaveDlg;