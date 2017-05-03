'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, Glyphicon} from 'react-bootstrap';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import AppsActions from '../actions/appsActions.js';
import BaseInput from './baseInput.js';

const UserWorkflows=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return { onEdit: {} };
	},

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

	handleEdit: function(e) {
		let wfid=e.target.value;
		this.state.onEdit[wfid]=true;
		this.setState({});
	},

	handleSave: function(e) {
		let wfid=e.target.value;
		let formData={id: wfid, name: this.refs[wfid + '_nameInput'].state.value, description: this.refs[wfid + '_descInput'].state.value};
		WorkflowActions.updateWorkflow(formData);
		delete this.state.onEdit[wfid];
		this.setState({});
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let workflowItems;
		if (workflowStore.workflows.length) {
			workflowItems=workflowStore.workflows.map(function(workflow, i) {
				let onEdit=this.state.onEdit[workflow.workflow_id];
				let loadButton=<Button bsStyle='link' onClick={this.handleLoad} value={workflow.workflow_id}>Load</Button>;
				let delButton=<Button bsStyle='link' onClick={this.handleDel} value={workflow.workflow_id}>Delete</Button>;
				let editButton=<Button bsStyle='link' onClick={this.handleEdit} value={workflow.workflow_id}>Edit</Button>;
				let saveButton=<Button bsStyle='link' onClick={this.handleSave} value={workflow.workflow_id}>Save</Button>;
				let item;
				if (onEdit) {
					let nameInput={
						name: 'name',
						required: true,
						value: workflow.name,
						type: 'text'
					};
					let descInput={
						name: 'description',
						required: false,
						value: workflow.description,
						type: 'text'
					};
					item=<tr key={workflow.workflow_id}><td><BaseInput data={nameInput} onValidate={true} ref={workflow.workflow_id + '_nameInput'}/></td><td><BaseInput data={descInput} ref={workflow.workflow_id + '_descInput'}/></td><td>{loadButton}{delButton}{saveButton}</td></tr>;
				} else {
					item=<tr key={workflow.workflow_id}><td>{workflow.name}</td><td>{workflow.description}</td><td>{loadButton}{delButton}{editButton}</td></tr>;
				}
				return item;
			}.bind(this));
		}
		return (
			<Panel header="My Workflows">
				<Table striped condensed hover>
					<thead>
						<tr><th class='col-xs-2 col-md-2'>Name</th><th class='col-xs-9 col-md-9'>Description</th><th class='col-xs-1 col-md-1'> </th></tr>
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
