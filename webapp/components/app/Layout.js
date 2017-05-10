import React from 'react';

require('../../stylesheets/app/layout.scss');

class Layout extends React.Component {
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
                <p>Frank Reshman</p>
              </li>
              <li>
                <button>signout</button>
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
