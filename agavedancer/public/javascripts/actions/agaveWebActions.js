'use strict';

import Reflux from 'reflux';

var AgaveWebActions=Reflux.createActions([
	'setupAgaveWebApps',
	'listAgaveWebApps',
	'showAgaveWebApps',
	'submitAgaveWebApps',
	'showAgaveWebJobs',
	'hideAgaveWebJobs',
	'listAgaveWebJobs'
]);

module.exports = AgaveWebActions;
