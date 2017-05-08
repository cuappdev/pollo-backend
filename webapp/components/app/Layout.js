import React from 'react';

require('../../stylesheets/app/app.scss');

class Layout extends React.Component {
  render () {
    return (
      <div className='app-container'>
        <header>
          <button>Back</button>
          <h1>CliquePod</h1>
          <nav>
            <ul>
              <li>
                Name
              </li>
              <li>
                <button>Signout</button>
              </li>
            </ul>
          </nav>
        </header>
        {this.props.children}
      </div>
    );
  }
}

export default Layout;
