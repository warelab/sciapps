'use strict';

import Reflux from 'reflux';

const WorkflowActions=Reflux.createActions([
	'resetState',
	'showNode',
	'showWorkflowLoadBox',
	'hideWorkflowLoadBox',
	'showWorkflowDiagram',
	'hideWorkflowDiagram',
	'showWorkflow',
	'hideWorkflow',
	'listWorkflow',
	'setWorkflow',
	'saveWorkflow',
	'deleteWorkflow',
	'workflowJobsReady',
	'setWorkflowSteps',
	'buildWorkflow',
	'submitWorkflow'
]);

module.exports = WorkflowActions;
