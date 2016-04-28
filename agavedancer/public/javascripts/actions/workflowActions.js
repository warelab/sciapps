'use strict';

import Reflux from 'reflux';

const WorkflowActions=Reflux.createActions([
	'setWorkflowSteps',
	'buildWorkflow'
]);

module.exports = WorkflowActions;
