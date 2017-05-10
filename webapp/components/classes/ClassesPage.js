import React from 'react';

import ClassesList from './ClassesList';

require('../../stylesheets/classes/ClassesPage.scss');

class ClassesPage extends React.Component {
  render () {
    return (
      <div className='classes-page'>
        <h1>Your class list</h1>
        <p>Choose a class to view past polls</p>
        <ClassesList />
        <button id='add-class-button'>+ Add class</button>
      </div>
    );
  }
}

export default ClassesPage;
