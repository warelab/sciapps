'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, ButtonToolbar, ButtonGroup, Tooltip, OverlayTrigger, Glyphicon} from 'react-bootstrap';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import AppsActions from '../actions/appsActions.js';
import Dialog from 'react-bootstrap-dialog';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import utilities from '../libs/utilities.js';

const UserWorkflows=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

	handleLoad: function(e) {
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
		if (wfid) {
			let wf=_.find(this.state.workflowStore.workflows, {workflow_id: wfid});
			if (wf) {
				AppsActions.showPage('workflowRunner');
				WorkflowActions.showWorkflow(wfid, wf);
			}
		}
	},

	showWorkflowDiagram: function(e) {
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
		if (wfid) {
			let wf=_.find(this.state.workflowStore.workflows, {workflow_id: wfid});
			if (wf) {
				WorkflowActions.showWorkflowDiagram(wfid, wf);
			}
		}
	},

	handleDeleteRow: function(e) {
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
		if (wfid) {
			this.handleConfirmDeleteRow(function() {
				table.store.setSelectedRowKey([]);
				WorkflowActions.deleteWorkflow(wfid);
			});
		}
	},

	handleConfirmDeleteRow: function(next) {
		this.refs.dialog.show({
			body: 'Are you sure you want to delete this workflow?',
			actions: [
				Dialog.CancelAction(),
				Dialog.Action(
					'Delete',
					() => {
						next();
					},
					'btn-warning'
				),
			]
		})
	},

	handleDownload: function(e) {
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
		if (wfid) {
			let wf=_.find(this.state.workflowStore.workflows, {workflow_id: wfid});
			if (wf) {
				wf.id=wf.workflow_id;
				utilities.download(wf.name + '.json', 'application/json;charset=utf-8', JSON.stringify(wf));
			}
		}
	},

	handleShare: function(e) {
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
		if (wfid) {
			let url=window.location.protocol + "//" + window.location.host + '/?wf_id=' + wfid;
			let link=<div>Please share this link: <a href={url} target='_blank'>{url}</a></div>;
			this.refs.dialog.showAlert(link);
		}
	},

	handleCellSave: function(row, cellName, cellValue) {
		let formData=_.pick(row, ['workflow_id', 'name', 'description']);
		WorkflowActions.updateWorkflow(formData);
	},

	actionsFormatter: function(cell, row) {
		return cell;
	},

	createCustomButtonGroup: function(props) {
		let tooltipload=<Tooltip id="tooltipload">Load</Tooltip>;
		let tooltipdownload=<Tooltip id="tooltipdownload">Download</Tooltip>;
		let tooltipdelete=<Tooltip id="tooltipdelete">Delete</Tooltip>;
		return (
			<ButtonGroup>
				<Button key='load' bsStyle='success' onClick={this.handleLoad}><Glyphicon glyph='repeat'/> Load</Button>
				<Button key='view' bsStyle='warning' onClick={this.showWorkflowDiagram}><Glyphicon glyph='modal-window'/> Visualize</Button>
        <Button key='share' bsStyle='info' onClick={this.handleShare}><Glyphicon glyph='link'/> Share</Button>
				<Button key='delete' bsStyle='danger' onClick={this.handleDeleteRow}><Glyphicon glyph='trash'/> Delete</Button>
			</ButtonGroup>
		);
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let workflowItems;
		if (workflowStore.workflows.length) {
			workflowItems=workflowStore.workflows.map(function(workflow, i) {
				let item=_.pick(workflow, ['workflow_id', 'name', 'description']);
				return item;
			}.bind(this));
		}

		let cellEditProp={
			mode: 'dbclick',
			blurToSave: true,
			afterSaveCell: this.handleCellSave
		};
		let selectRowProp={
			mode: 'radio'
		};
		let options={
			btnGroup: this.createCustomButtonGroup
		};
		return (
			<Panel header="My Workflows">
				<BootstrapTable ref='table' data={workflowItems} search={true} striped={true} hover={true} cellEdit={cellEditProp} pagination={true} selectRow={selectRowProp} options={options}>
					<TableHeaderColumn isKey={true} dataField="workflow_id" hidden={true}>ID</TableHeaderColumn>
					<TableHeaderColumn dataField="name" dataAlign="left" width='250' dataSort={true}>Name</TableHeaderColumn>
					<TableHeaderColumn dataField="description" dataAlign="left">Description</TableHeaderColumn>
				</BootstrapTable>
				<Dialog ref='dialog' />
			</Panel>
		);
	}
});

module.exports = UserWorkflows;
