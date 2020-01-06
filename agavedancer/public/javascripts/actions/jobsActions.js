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
	'deleteJobs',
	'setWorkflowJobOutputs',
	'resetWorkflowJobs',
	'setJobOutputs',
	'stageJobOutputs',
	'showJobOutputsDetail',
	'hideJobOutputsDetail',
	'setFile',
	'checkJobStatus',
	'debouncedCheckWorkflowJobStatus',
	'checkWorkflowJobStatus',
	'resubmitJob',
	'addWorkflowBuilderJobIndex',
	'removeWorkflowBuilderJobIndex'
]);

module.exports = JobsActions;
