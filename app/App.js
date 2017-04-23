import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router';
import createBrowserHistory from 'react-router/node_modules/history/lib/createHistory';

import routes from './routes';

const history = createBrowserHistory();

ReactDOM.render(<Router history={history} routes={routes} />, document.getElementById('root'));
