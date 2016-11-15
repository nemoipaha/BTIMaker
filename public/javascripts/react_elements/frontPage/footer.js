import React from 'react';

export default class Footer extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <footer className="page-footer teal">
        <div className="container">
          <div className="row">
            <div className="col l6 s12">
              <h5 className="white-text">{ this.props.lang.footerHeader }</h5>
              <p className="grey-text text-lighten-4">{ this.props.lang.footerText }</p>
            </div>
            <div className="col l3 s12">
              <h5 className="white-text"></h5>
              <ul>
              </ul>
            </div>
            <div className="col l3 s12">
              <h5 className="white-text"></h5>
              <ul>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="container">
            { this.props.lang.footerLabel } &copy;
          </div>
        </div>
      </footer>
    );
  }
}

Footer.ContextTypes = {
  lang: React.PropTypes.object.isRequired,
  user: React.PropTypes.object,
};