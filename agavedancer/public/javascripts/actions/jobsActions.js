'use strict';

import Reflux from 'reflux';

const JobsActions=Reflux.createActions([
	'listJobs',
	'submitWorkflowJobs',
	'submitJob',
	'showJob',
	'hideJob',
	'setJob',
	'setJobs',
	'setWorkflowJobOutputs',
	'resetWorkflowJobs',
	'showJobOutputs',
	'resubmitJob',
	'resetResubmit'
]);

module.exports = JobsActions;
