'use strict';

import Reflux from 'reflux';

var JobsActions=Reflux.createActions([
	'listJobs',
	'submitJob',
	'showJob',
	'hideJob',
	'showJobResults',
	'resubmitJob',
	'resetResubmit'
]);

module.exports = JobsActions;
