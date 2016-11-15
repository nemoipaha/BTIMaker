import React from 'react';

export default class Content extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="main">
        <div className="container">
          <h1 className="header center teal-text text-lighten-2">
            { this.props.lang.header }</h1>
          <div className="row center">
            <a href="/editor" className="btn-large waves-effect waves-light teal lighten-1">
              { this.props.lang.createProject }</a>
          </div>
          <br/><br/>
        </div>

        <div className="img-container">
          <img src="frontPage/1.png" alt=""/></div>

        <div className="container">
          <div className="section">
            <div className="row">
              <div className="col s12 m4">
                <div className="icon-block">
                  <h2 className="center brown-text">
                    <i className="material-icons">flash_on</i></h2>
                  <h5 className="center">{ this.props.lang.firstTitle }</h5>
                  <p className="light">{ this.props.lang.firstText }</p>
                </div>
              </div>

              <div className="col s12 m4">
                <div className="icon-block">
                  <h2 className="center brown-text"><i className="material-icons">group</i></h2>
                  <h5 className="center">{ this.props.lang.secondTitle }</h5>
                  <p className="light">{ this.props.lang.secondText }</p>
                </div>
              </div>

              <div className="col s12 m4">
                <div className="icon-block">
                  <h2 className="center brown-text"><i className="material-icons">settings</i></h2>
                  <h5 className="center">{ this.props.lang.thirdTitle }</h5>
                  <p className="light">{ this.props.lang.thirdText }</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="img-container"><img src="frontPage/2.png" alt="Unsplashed background img 2"/></div>

        <div className="container">
          <div className="section">

            <div className="row">
              <div className="col s12 center">
                <h3><i className="mdi-content-send brown-text"></i></h3>
                <h4>{ this.props.lang.contactTitle }</h4>
                <p className="left-align light">{ this.props.lang.about }</p>
              </div>
            </div>

          </div>
        </div>

        <div className="img-container">
          <img src="frontPage/3.png" alt="Unsplashed background img 3"/></div>
      </div>
    );
  }
}

Content.ContextTypes = {
  lang: React.PropTypes.object.isRequired,
  user: React.PropTypes.object,
};