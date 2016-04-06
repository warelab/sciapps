'use strict';

import Reflux from 'reflux';

var AppsActions=Reflux.createActions([
	'listApps',
	'debouncedListApps',
	'showAppByJob',
	'showApp',
	'hideApp',
	'showPage'
]);

module.exports = AppsActions;
