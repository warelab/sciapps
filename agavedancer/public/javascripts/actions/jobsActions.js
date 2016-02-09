'use strict';

import Reflux from 'reflux';

var JobsActions=Reflux.createActions([
	'listJobs',
	'submitJob',
	'showJob',
	'hideJob',
	'showJobResults'
]);

module.exports = JobsActions;
