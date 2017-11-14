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
	'updateWorkflow',
	'saveWorkflow',
	'deleteWorkflow',
	'updateWorkflowJob',
	'workflowJobsReady',
	'setRemoteWorkflow',
	'loadRemoteWorkflow',
	'setWorkflowSteps',
	'buildWorkflow',
	'submitWorkflow',
	'buildWorkflowDiagramDef'
]);

module.exports = WorkflowActions;
