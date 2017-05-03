import React from 'react';

require('../stylesheets/all.scss');

class Layout extends React.Component {
  render () {
    return (
      <div>
        Layout
        {this.props.children}
      </div>
    );
  }
}

export default Layout;
