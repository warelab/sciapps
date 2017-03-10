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
	'setFile',
	'checkJobStatus',
	'checkWorkflowJobStatus',
	'resubmitJob',
	'resetResubmit',
	'addWorkflowBuilderJobIndex',
	'removeWorkflowBuilderJobIndex'
]);

module.exports = JobsActions;
