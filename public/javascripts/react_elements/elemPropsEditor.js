import React from 'react';
import ColorComponent from "./colorComponent";
import Slider from 'material-ui/lib/slider';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

class ElemPropsEditor extends React.Component {
  constructor(props){
   super();
      this.state = {
          menu:["Never","Every Night","Weeknights","Weekends","Weekly"]
      };
  }

  render() {
    switch (this.props.value) {
      case 'color':
        return (
          <ColorComponent element={this.props.element} title="Цвет" />
        );
      case 'width':
        return (
          <div>
            <Slider />
          </div>
        );
      case 'number':
        return (
          <div>
            <SelectField value={2} onChange={this.handleChange}>
              <MenuItem value={1} primaryText="Never"/>
              <MenuItem value={2} primaryText="Every Night"/>
              <MenuItem value={3} primaryText="Weeknights"/>
              <MenuItem value={4} primaryText="Weekends"/>
              <MenuItem value={5} primaryText="Weekly"/>
            </SelectField>
          </div>
        );
    }
  }
}

export default ElemPropsEditor;