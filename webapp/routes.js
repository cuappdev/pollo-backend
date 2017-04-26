import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/Layout';
import Landing from './components/landing/Landing';
import Home from './components/home/Home';
import Login from './components/login/Login';

export default (
  <Route path='/' component={Layout}>
    <IndexRoute component={Landing} />
    <Route path='/app' component={Home} />
    <Route path='/login' component={Login} />
  </Route>
);
