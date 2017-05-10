import React from 'react';

require('../../stylesheets/classes/ClassesList.scss');

class ClassesList extends React.Component {
  render () {
    return (
      <ul className='classes-list'>
        <li className='class-item'>ASTRO 1101: Introduction To Astronomy</li>
        <li className='class-item'>INFO 1200: Information Ethics, Law, and Policy</li>
        <li className='class-item'>INFO 2950: Introduction to Data Science</li>
      </ul>
    );
  }
}

export default ClassesList;
