'use strict';

import Reflux from 'reflux';

const WorkflowActions=Reflux.createActions([
	'showNode',
	'showWorkflowLoadBox',
	'hideWorkflowLoadBox',
	'showWorkflowDiagram',
	'hideWorkflowDiagram',
	'showWorkflow',
	'hideWorkflow',
	'setWorkflowSteps',
	'buildWorkflow',
	'submitWorkflow'
]);

module.exports = WorkflowActions;
