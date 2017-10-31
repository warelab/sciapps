'use strict';

import React from 'react';
import WorkflowRunnerForm from './workflowRunnerForm.js';
import {Panel} from 'react-bootstrap';

const WorkflowRunner=React.createClass({
	render: function() {
		let user=this.props.user;
		return (
			<Panel>
				<WorkflowRunnerForm user={user} />
			</Panel>
		);
	}
});

module.exports = WorkflowRunner;
