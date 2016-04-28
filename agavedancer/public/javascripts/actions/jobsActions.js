'use strict';

import Reflux from 'reflux';

const JobsActions=Reflux.createActions([
	'listJobs',
	'submitJob',
	'showJob',
	'hideJob',
	'setJob',
	'setWorkflowJobOutputs',
	'resetWorkflowJobs',
	'showJobOutputs',
	'resubmitJob',
	'resetResubmit'
]);

module.exports = JobsActions;
