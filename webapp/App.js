import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Layout from './components/app/Layout';
import NotFound from './components/app/NotFound';
import Landing from './components/landing/Landing';
import Home from './components/home/Home';
import Login from './components/login/Login';

render(
  <Router>
    <Layout>
      <Switch>
        <Route exact path='/' component={Landing} />
        <Route exact path='/app' component={Home} />
        <Route path='/login' component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  </Router>
  , document.getElementById('root')
);
