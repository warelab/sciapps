'use strict';

import React from 'react';
import Reflux from 'reflux';
import {Panel} from 'react-bootstrap';
import WorkflowBuilderForm from './workflowBuilderForm.js';

const WorkflowBuilder=React.createClass({
	render: function() {
		let header='Workflow building form: chain jobs together';
		return (
			<Panel header={header}>
				<WorkflowBuilderForm />
			</Panel>
		);
	}
});

module.exports = WorkflowBuilder;
