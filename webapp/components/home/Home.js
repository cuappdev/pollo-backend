import React from 'react';

import io from 'socket.io-client';

class Home extends React.Component {
  componentDidMount () {
    const socket = io('/');

    this._socket = socket;
  }

  render () {
    return (
      <div>Home</div>
    );
  }
}

export default Home;
