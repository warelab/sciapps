'use strict';

require('../styles/main.less');

import React from 'react'; 
import ReactDom from 'react-dom'; 
import { Router, Route, hashHistory, browserHistory, IndexRoute } from 'react-router';
import App from './components/app.js';
import Help from './components/help.js';
import AppsDetail from './components/appsDetail.js';

ReactDom.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={App}/>
      <Route path="/page/:page_id" component={App} />
      <Route path="/app/:app_id" component={App} />
      <Route path="/workflowf/:wf_id" component={App} />
    </Route>
  </Router>
), document.getElementById('content'));
