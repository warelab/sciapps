'use strict';

import Reflux from 'reflux';

var AgaveWebActions=Reflux.createActions([
	'setupAgaveWebApps',
	'listAgaveWebApps',
	'showAgaveWebApps',
	'submitAgaveWebApps',
	'showAgaveWebJobs',
	'hideAgaveWebJobs',
	'listAgaveWebJobs',
	'showAgaveWebDataStore',
	'hideAgaveWebDataStore',
	'setAgaveWebDataStoreItemTarget',
	'selectAgaveWebDataStoreItem',
	'showAgaveWebJobResults'
]);

module.exports = AgaveWebActions;
