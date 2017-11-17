'use strict';

import Reflux from 'reflux';

const JobsActions=Reflux.createActions([
	'listJob',
	'resetState',
	'submitWorkflowJobs',
	'submitJob',
	'showFile',
	'hideFile',
	'showJob',
	'hideJob',
	'setJob',
	'setJobs',
	'removeJobs',
	'setWorkflowJobOutputs',
	'resetWorkflowJobs',
	'setJobOutputs',
	'setFile',
	'checkJobStatus',
	'debouncedCheckWorkflowJobStatus',
	'checkWorkflowJobStatus',
	'resubmitJob',
	'addWorkflowBuilderJobIndex',
	'removeWorkflowBuilderJobIndex'
]);

module.exports = JobsActions;
