'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, ButtonToolbar, ButtonGroup, Tooltip, OverlayTrigger, Glyphicon} from 'react-bootstrap';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import Dialog from 'react-bootstrap-dialog';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import utilities from '../libs/utilities.js';

var workflowItems = [
	{ workflow_id: 1, name: "Annotation", description: "Performing MAKER based annotation" },
	{ workflow_id: 2, name: "Assembly", description: "Small genome assembly, quality assessment, and annotation with JBrowse view" },
	{ workflow_id: 3, name: "Association", description: "A GWAS workflow for performing mixed model analysis with three different algorithms" }
];

const publicWorkflows=React.createClass({

	handleLoad: function(e) {
		let table=this.refs.table;
		let wfid=table.store.selected[0];
		if (wfid) {
			let wfDetail=wfid.json ? JSON.parse(wf.json) : undefined;
			AppsActions.showPage('workflowRunner');
			WorkflowActions.showWorkflow(wfid, wfDetail);
		}
	},

	createCustomButtonGroup: function(props) {
		let tooltipload=<Tooltip id="tooltipload">Load</Tooltip>;
		return (
			<ButtonGroup>
				<Button key='load' bsStyle='success' onClick={this.handleLoad}><Glyphicon glyph='repeat'/>Load</Button>
			</ButtonGroup>
		);
	},

	render: function() {

		let selectRowProp={
			mode: 'radio'
		};
		let options={
			btnGroup: this.createCustomButtonGroup
		};

		return (
			<Panel header="Public Workflows">
				<BootstrapTable ref='table' data={workflowItems} striped={true} hover={true} pagination={true} selectRow={selectRowProp} options={options}>
					<TableHeaderColumn isKey={true} dataField="workflow_id" hidden={true}>ID</TableHeaderColumn>
					<TableHeaderColumn dataField="name" dataAlign="left" width='250' dataSort={true}>Name</TableHeaderColumn>
					<TableHeaderColumn dataField="description" dataAlign="left">Description</TableHeaderColumn>
				</BootstrapTable>
				<Dialog ref='dialog' />
			</Panel>
			<div className="welcome">
				<div className="section">
				<h5>Public workflows</h5>
				Click on any workflow below will load both the pipeline (main panel) and data (History panel). Workflow diagram can be shown from the bottom of the main panel.
				<ul className="list">
					<li><a href="#" onClick={this.showWorkflowRunner}>Association</a></li>
					<li><a href="#" onClick={this.showWorkflowRunner}>Annotation</a></li>
					<li><a href="#" onClick={this.showWorkflowRunner}>Assembly</a></li>
				</ul>
			</div>
		</div>
		);
	}
});

module.exports = publicWorkflows;
