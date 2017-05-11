import React from 'react';

require('../../stylesheets/app/layout.scss');

class Layout extends React.Component {
  handleSignOut () {
    
  }

  render () {
    return (
      <div className='main'>
        <header className='main-header'>
          <button id='main-nav-back'>
            <i className='fa fa-angle-left fa-2x' aria-hidden='true' />
          </button>
          <h1>CliquePod</h1>
          <nav className='main-nav'>
            <ul>
              <li>
                <p>{localStorage.getItem('name')}</p>
              </li>
              <li>
                <button onClick={() => this.handleSignOut()}>signout</button>
              </li>
            </ul>
          </nav>
        </header>
        <div className='main-content'>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Layout;
