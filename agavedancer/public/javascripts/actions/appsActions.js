'use strict';

import Reflux from 'reflux';

const AppsActions=Reflux.createActions([
	'listApps',
	'debouncedListApps',
	'showAppByJob',
	'showApp',
	'hideApp',
	'setApp',
	'setWorkflowApps',
	'resetWorkflowApps',
	'showPage'
]);

module.exports = AppsActions;
