import React from 'react';

class ClassPage extends React.Component {
  render () {
    return (
      <h1>Class page for {this.props.params.id}</h1>
    );
  }
}

export default ClassPage;
