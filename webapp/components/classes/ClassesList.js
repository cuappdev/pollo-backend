import React from 'react';

import { getClasses } from '../../utils/requests';

require('../../stylesheets/classes/ClassesList.scss');

class ClassesList extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      classes: JSON.parse(localStorage.getItem('classes')) || []
    };
  }
  componentDidMount () {
    getClasses((classes) => {
      this.setState({
        classes: classes
      });
    }, (error) => {
      console.log(error);
    });
  }
  render () {
    const classes = this.state.classes.length !== 0
      ? this.state.classes.map((c, i) => (
        <li className='class-item' key={i}>{c}</li>
      )) : (
        <p className='classes-empty'>No Classes. Join one!</p>
      );

    return (
      <ul className='classes-list'>
        {classes}
      </ul>
    );
  }
}

export default ClassesList;
