'use strict';

import Reflux from 'reflux';

const WorkflowActions=Reflux.createActions([
	'showWorkflow',
	'setWorkflowSteps',
	'buildWorkflow',
	'submitWorkflow'
]);

module.exports = WorkflowActions;
