import React from 'react';

require('../../stylesheets/app/app.scss');

class Layout extends React.Component {
  render () {
    return (
      <div className='app-container'>
        {this.props.children}
      </div>
    );
  }
}

export default Layout;
