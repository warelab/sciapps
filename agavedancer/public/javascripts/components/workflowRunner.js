'use strict';

import React from 'react';
import WorkflowLoadBox from './workflowLoadBox.js';
import WorkflowRunnerForm from './workflowRunnerForm.js';
import {Panel} from 'react-bootstrap';

const WorkflowRunner=React.createClass({
	render: function() {
		return (
			<Panel>
				<WorkflowLoadBox />
				<WorkflowRunnerForm />
			</Panel>
		);
	}
});

module.exports = WorkflowRunner;
