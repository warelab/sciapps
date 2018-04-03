'use strict';

import Reflux from 'reflux';

const AppsActions=Reflux.createActions([
	'listApps',
	'debouncedListApps',
	'showAppByJob',
	'showApp',
	'hideApp',
	'setApp',
	'setReload',
	'resetState',
	'setApps',
	'resetWorkflowApps',
	'showPage'
]);

module.exports = AppsActions;
