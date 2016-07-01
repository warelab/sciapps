'use strict';

import Reflux from 'reflux';

const WorkflowActions=Reflux.createActions([
	'showWorkflowDiagram',
	'hideWorkflowDiagram',
	'showWorkflow',
	'setWorkflowSteps',
	'buildWorkflow',
	'submitWorkflow'
]);

module.exports = WorkflowActions;
