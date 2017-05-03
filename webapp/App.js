import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Landing from './components/landing/Landing';
import Home from './components/home/Home';
import Login from './components/login/Login';

render(
  <Router>
    <Layout>
      <Route exact path='/' component={Landing} />
      <Route exact path='/app' component={Home} />
      <Route path='/login' component={Login} />
    </Layout>
  </Router>
  , document.getElementById('root')
);
