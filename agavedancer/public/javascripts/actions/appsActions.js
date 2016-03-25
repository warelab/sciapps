'use strict';

import Reflux from 'reflux';

var AppsActions=Reflux.createActions([
	'listApps',
	'debouncedListApps',
	'showApp',
	'hideApp'
]);

module.exports = AppsActions;
