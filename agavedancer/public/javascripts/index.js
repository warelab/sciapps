'use strict';

require('../styles/main.less');

import React from 'react'; 
import ReactDom from 'react-dom'; 
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import App from './components/app.js';
import Help from './components/help.js';
import AppsDetail from './components/appsDetail.js';

ReactDom.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={App}/>
      <Route path="/:page_id" component={App} />
    </Route>
  </Router>
), document.getElementById('content'));
