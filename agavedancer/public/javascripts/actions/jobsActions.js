'use strict';

import Reflux from 'reflux';

const JobsActions=Reflux.createActions([
	'listJobs',
	'submitWorkflowJobs',
	'submitJob',
	'showFile',
	'hideFile',
	'showJob',
	'hideJob',
	'setJob',
	'setJobs',
	'setWorkflowJobOutputs',
	'resetWorkflowJobs',
	'showJobOutputs',
	'setWorkflowInputs',
	'checkJobStatus',
	'checkWorkflowJobStatus',
	'resubmitJob',
	'resetResubmit'
]);

module.exports = JobsActions;
