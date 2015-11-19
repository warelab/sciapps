'use strict';

require('../styles/main.less');

import React from 'react'; 
import ReactDom from 'react-dom'; 
var App = React.createFactory(require('./components/app.js'));

ReactDom.render(
	new App(),
	document.getElementById('content')
)
