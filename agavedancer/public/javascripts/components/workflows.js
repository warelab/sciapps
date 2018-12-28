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
	{ workflow_id: 4, name: "RNA-Seq", description: "Gene level differential expression analysis with STAR, RSEM, and Ebseq" },
        { workflow_id: 5, name: "RNA-Seq2", description: "Isoform level differential expression analysis with STAR, StringTie, and Ballgown" },
        { workflow_id: 6, name: "RNA-Seq3", description: "Isoform level differential expression analysis with HISAT2, StringTie, and Ballgown" },
	{ workflow_id: 7, name: "Methylation", description: "Methylation analysis with Bismark and Bisukit" }
];

const publicWorkflows=React.createClass({

	handleReLaunch: function(e) {
		let table=this.refs.table;
		let wfid=table.store.selected[0];
		if (wfid) {
			AppsActions.showPage('workflowRunner');
			WorkflowActions.showWorkflow(wfid);
		}
	},

	handleLoad: function(e) {
		let table=this.refs.table;
		let wfid=table.store.selected[0];
		if (wfid) {
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
				<Button key='relaunch' bsStyle='success' onClick={this.handleReLaunch}><Glyphicon glyph='repeat'/> Relaunch</Button>
                                <Button key='view' bsStyle='info' onClick={this.showWorkflowDiagram}><Glyphicon glyph='modal-window'/> Visualize</Button>
				<Button key='load' bsStyle='warning' onClick={this.handleLoad}><Glyphicon glyph='hand-right'/> Load</Button>
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
