'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, Glyphicon} from 'react-bootstrap';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import AppsActions from '../actions/appsActions.js';

const UserWorkflows=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	handleLoad: function(e) {
		let wfid=e.target.value;
		let wf=_.find(this.state.workflowStore.workflows, {workflow_id: wfid});
		let wfDetail=wf.json ? JSON.parse(wf.json) : undefined;
		AppsActions.showPage('workflowRunner');
		WorkflowActions.showWorkflow(wfid, wfDetail);
	},

	handleDel: function(e) {
		let wfid=e.target.value;
		WorkflowActions.deleteWorkflow(wfid);
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let workflowItems;
		if (workflowStore.workflows.length) {
			workflowItems=workflowStore.workflows.map(function(workflow, i) {
				let loadButton=<Button bsStyle='link' onClick={this.handleLoad} value={workflow.workflow_id}>Load</Button>;
				let delButton=<Button bsStyle='link' onClick={this.handleDel} value={workflow.workflow_id}>Delete</Button>;
				return <tr key={workflow.workflow_id}><td>{workflow.name}</td><td>{workflow.desc}</td><td>{loadButton}{delButton}</td></tr>;
			}.bind(this));
		}
		return (
			<Panel header="My Workflows">
				<Table striped condensed hover>
					<thead>
						<tr><th>Name</th><th>Description</th><th>Actions</th></tr>
					</thead>
					<tbody>
						{workflowItems}
					</tbody>
				</Table>
			</Panel>
		);
	}
});

module.exports = UserWorkflows;
