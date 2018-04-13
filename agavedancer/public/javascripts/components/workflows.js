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
	{ workflow_id: 3, name: "Association", description: "A GWAS workflow for performing mixed model analysis with three different algorithms" },
	{ workflow_id: 4, name: "RNA-Seq", description: "ENCODE RNA-Seq workflow for differential expression analysis" },
	{ workflow_id: 5, name: "Variant Calling", description: "Variant calling workflow with Platypus" }
];

const publicWorkflows=React.createClass({

	handleLoad: function(e) {
		let table=this.refs.table;
		let wfid=table.store.selected[0];
		if (wfid) {
			AppsActions.showPage('workflowRunner');
			WorkflowActions.showWorkflow(wfid);
		}
	},

	showWorkflowDiagram: function(e) {
		let table=this.refs.table;
		let wfid=table.store.selected[0];
		if (wfid) {
			WorkflowActions.showWorkflowDiagram(wfid);
		}
	},

	createCustomButtonGroup: function(props) {
		let tooltipload=<Tooltip id="tooltipload">Load</Tooltip>;
		return (
			<ButtonGroup>
				<Button key='load' bsStyle='success' onClick={this.handleLoad}><Glyphicon glyph='repeat'/> Load</Button>
				<Button key='view' bsStyle='warning' onClick={this.showWorkflowDiagram}><Glyphicon glyph='modal-window'/> Visualize</Button>
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
		);
	}
});

module.exports = publicWorkflows;
