import React from 'react';

import { Link } from 'react-router';

require('../../stylesheets/app/layout.scss');

class Layout extends React.Component {
  handleSignOut () {

  }

  render () {
    const path = this.props.location.pathname;
    const parentPath = path.substring(0, path.lastIndexOf('/'));
    return (
      <div className='main'>
        <header className='main-header'>
          {path === '/app/classes' ? null
            : (
              <Link to={parentPath} id='main-nav-back'>
                <i className='fa fa-angle-left fa-2x' aria-hidden='true' />
              </Link>
          )}
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
