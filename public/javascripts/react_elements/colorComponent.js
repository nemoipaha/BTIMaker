import React from 'react';
import { ChromePicker }  from 'react-color';

class ColorComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      displayColorPicker: true
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChangeComplete = this.handleChangeComplete.bind(this);
  }

  componentDidMount() {
    this.element = this.props.element;
  }

  handleClick() {
    var color = this.element.attrs.fill;
    this.setState({
      color: color,
      displayColorPicker: !this.state.displayColorPicker
    });

    //return false;
  }

  handleChangeComplete(color) {
    var fill = '#' + color.hex;
    this.element.attr({
      fill: fill
    });
  }

  handleClose() {
    this.setState({ displayColorPicker: false })
  }

  render() {
    const popover = {
      position: 'absolute'
      //zIndex: '2'
    };
    const cover = {
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    };
    return (
      <div>
        { this.props.title }
        { this.state.displayColorPicker ?
          <div>
            <ChromePicker
              color={ this.state.color }
              onChangeComplete={ this.handleChangeComplete }
            />
          </div>
          : null
        }
      </div>
    )
  }
}

export default ColorComponent;