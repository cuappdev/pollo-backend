import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, Redirect, browserHistory } from 'react-router';

import Layout from './components/app/Layout';
import Login from './components/login/Login';
import NotFound from './components/app/NotFound';
import Landing from './components/landing/Landing';
import ClassesPage from './components/classes/ClassesPage';
import ClassPage from './components/class/ClassPage';

render(
  <Router history={browserHistory}>
    <Route path='/'>
      <IndexRoute component={Landing} />
      <Route path='login' component={Login} />
      <Route path='app' component={Layout}>
        <IndexRedirect to='classes' />
        <Route path='classes' component={ClassesPage} />
        <Route path='classes/:id' component={ClassPage} />
        <Redirect from='*' to='classes' />
      </Route>
      <Route path='*' component={NotFound} />
    </Route>
  </Router>
  , document.getElementById('root')
);
