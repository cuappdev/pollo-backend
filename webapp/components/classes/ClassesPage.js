import React from 'react';

import ClassesList from './ClassesList';

class ClassesPage extends React.Component {
  render () {
    return (
      <div>
        <h1>Your class list</h1>
        <p>Choose a class to view past polls</p>
        <ClassesList />
        <button>+ Add class</button>
      </div>
    );
  }
}

export default ClassesPage;
