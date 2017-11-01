'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Panel} from 'react-bootstrap';
import WorkflowBuilderForm from './workflowBuilderForm.js';

const WorkflowBuilder=React.createClass({
	render: function() {
		let header='Workflow building form: chains jobs from the right (History) panel';
		return (
			<Panel header={header}>
				<WorkflowBuilderForm />
			</Panel>
		);
	}
});

module.exports = WorkflowBuilder;
