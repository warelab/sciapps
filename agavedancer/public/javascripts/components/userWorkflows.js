'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, ButtonToolbar, Tooltip, OverlayTrigger, Glyphicon} from 'react-bootstrap';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import AppsActions from '../actions/appsActions.js';
import BaseInput from './baseInput.js';
import Dialog from 'react-bootstrap-dialog';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import utilities from '../libs/utilities.js';

const UserWorkflows=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return { onEdit: {} };
	},

	handleLoad: function(e) {
		let wfid=e.target.value || e.target.parentElement.value;
		let wf=_.find(this.state.workflowStore.workflows, {workflow_id: wfid});
		let wfDetail=wf.json ? JSON.parse(wf.json) : undefined;
		AppsActions.showPage('workflowRunner');
		WorkflowActions.showWorkflow(wfid, wfDetail);
	},

	handleDel: function(e) {
		let wfid=e.target.value || e.target.parentElement.value;
		WorkflowActions.deleteWorkflow(wfid);
	},

	handleEdit: function(e) {
		let wfid=e.target.value || e.target.parentElement.value;
		this.state.onEdit[wfid]=true;
		this.setState({});
	},

	handleDownload: function(e) {
		let wfid=e.target.value || e.target.parentElement.value;
		let wf=_.find(this.state.workflowStore.workflows, {workflow_id: wfid});
		utilities.download(wf.name + '.json', 'application/json;charset=utf-8', wf.json);
	},

	handleSave: function(e) {
		let wfid=e.target.value || e.target.parentElement.value;
		let formData={id: wfid, name: this.refs[wfid + '_nameInput'].state.value, description: this.refs[wfid + '_descInput'].state.value};
		let workflows=this.state.workflowStore.workflows;
		let existed=_.find(workflows, 'name', formData.name);
		if (existed && existed.workflow_id !== wfid) {
			//alert('Please choose a unique name.');
			this.refs.dialog.showAlert('A workflow with that name already exists. Please enter a different name');
		} else {
			WorkflowActions.updateWorkflow(formData);
			delete this.state.onEdit[wfid];
			this.setState({});
		}
	},

	handleCancel: function(e) {
		let wfid=e.target.value || e.target.parentElement.value;
		delete this.state.onEdit[wfid];
		this.setState({});
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let workflowItems;
		if (workflowStore.workflows.length) {
			workflowItems=workflowStore.workflows.map(function(workflow, i) {
				let onEdit=this.state.onEdit[workflow.workflow_id];

				let tooltipload=<Tooltip id="tooltipload">Load</Tooltip>;
        			let loadButton=<OverlayTrigger placement="bottom" overlay={tooltipload}><Button key='load' bsStyle='link' onClick={this.handleLoad} value={workflow.workflow_id}><Glyphicon glyph='repeat'/></Button></OverlayTrigger>;

				let tooltipdelete=<Tooltip id="tooltipdelete">Delete</Tooltip>;
        			let delButton=<OverlayTrigger placement="bottom" overlay={tooltipdelete}><Button key='del' bsStyle='link' onClick={this.handleDel} value={workflow.workflow_id}><Glyphicon glyph='remove-circle'/></Button></OverlayTrigger>;				

				let tooltipedit=<Tooltip id="tooltipedit">Edit</Tooltip>;
        			let editButton=<OverlayTrigger placement="bottom" overlay={tooltipedit}><Button key='edit' bsStyle='link' onClick={this.handleEdit} value={workflow.workflow_id}><Glyphicon glyph='edit'/></Button></OverlayTrigger>;				

				let tooltipdownload=<Tooltip id="tooltipdownload">Download</Tooltip>;
        			let downloadButton=<OverlayTrigger placement="bottom" overlay={tooltipdownload}><Button key='download' bsStyle='link' onClick={this.handleDownload} value={workflow.workflow_id}><Glyphicon glyph='download-alt'/></Button></OverlayTrigger>;				

				let tooltipsave=<Tooltip id="tooltipsave">Save</Tooltip>;
        			let saveButton=<OverlayTrigger placement="bottom" overlay={tooltipsave}><Button key='save' bsStyle='link' onClick={this.handleSave} value={workflow.workflow_id}><Glyphicon glyph='ok'/></Button></OverlayTrigger>;				

				let tooltipcancel=<Tooltip id="tooltipcancel">Cancel</Tooltip>;
        			let cancelButton=<OverlayTrigger placement="bottom" overlay={tooltipcancel}><Button key='cancel' bsStyle='link' onClick={this.handleCancel} value={workflow.workflow_id}><Glyphicon glyph='remove'/></Button></OverlayTrigger>;

				let item;
				let toolbar;
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
					item=<tr key={workflow.workflow_id}><td><BaseInput data={nameInput} onValidate={true} ref={workflow.workflow_id + '_nameInput'}/></td><td className='text-center'><BaseInput data={descInput} ref={workflow.workflow_id + '_descInput'}/></td><td className='text-right'>{saveButton}{cancelButton}</td></tr>;
				} else {
					toolbar=(
						<ButtonToolbar>
							{loadButton}{editButton}{downloadButton}{delButton}	
						</ButtonToolbar>
					);
					item=<tr key={workflow.workflow_id}><td>{workflow.name}</td><td>{workflow.description}</td><td className='text-right'>{loadButton}{editButton}{downloadButton}{delButton}</td></tr>;
				}
				return item;
			}.bind(this));
		}
		return (
			<Panel header="My Workflows">
				<BootstrapTable data={workflowItems} striped={true} hover={true}>
					<TableHeaderColumn dataField="name" dataAlign="left" dataSort={true}>Name</TableHeaderColumn>
					<TableHeaderColumn dataField="description" dataAlign="left" dataSort={true}>Description</TableHeaderColumn>
				</BootstrapTable>
				<Dialog ref='dialog' />
			</Panel>
		);
	}
});

module.exports = UserWorkflows;
