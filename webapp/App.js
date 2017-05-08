import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Layout from './components/app/Layout';
import NotFound from './components/app/NotFound';
import Landing from './components/landing/Landing';
import ClassesPage from './components/classes/classesPage';
import Login from './components/login/Login';

const loggedIn = true;

render(
  <Router>
    <Switch>
      <Route exact path='/' render={() => (
        loggedIn ? (
          <Redirect to='/app' />
        ) : (
          <Landing />
        )
      )} />
      <Layout>
        <Switch>
          <Route path='/app' component={ClassesPage} />
          <Route path='/login' component={Login} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Switch>
  </Router>
  , document.getElementById('root')
);
