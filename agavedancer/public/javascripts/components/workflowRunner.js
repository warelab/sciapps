'use strict';

import React from 'react';
import WorkflowLoadBox from './workflowLoadBox.js';
import WorkflowRunnerForm from './workflowRunnerForm.js';
import {Panel} from 'react-bootstrap';

const WorkflowRunner=React.createClass({
	render: function() {
		let user=this.props.user;
		return (
			<Panel>
				<WorkflowLoadBox />
				<WorkflowRunnerForm user={user} />
			</Panel>
		);
	}
});

module.exports = WorkflowRunner;
