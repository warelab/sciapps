'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, ButtonToolbar, ButtonGroup, Tooltip, OverlayTrigger, Glyphicon, Input} from 'react-bootstrap';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import AppsActions from '../actions/appsActions.js';
import Dialog from 'react-bootstrap-dialog';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import utilities from '../libs/utilities.js';

const UserWorkflows=React.createClass({
	mixins: [Reflux.connect(WorkflowStore, 'workflowStore')],

  getInitialState: function() {
    return {
      workflows: undefined
    }
  },

  /*
  ### Description
  reload workflow to main panel for resubmission w/o loading jobs to history panel
  */
	handleRelaunch: function(e) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
    let workflows=dataItem ? workflowStore.dataWorkflows[dataItem] : workflowStore.workflows;
		if (wfid) {
			let wf=_.find(workflows, {workflow_id: wfid});
			if (wf) {
				AppsActions.showPage('workflowRunner');
				WorkflowActions.showWorkflow(wfid, wf, true);
			}
		}
	},

  /*
  ### Description
  refresh user workflow table widget
  */
	handleRefresh: function(e) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
		WorkflowActions.listWorkflow(dataItem);
	},

  /*
  ### Description
  load workflow jobs to history panel only
  */
	handleLoad: function(e) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
    let workflows=dataItem ? workflowStore.dataWorkflows[dataItem] : workflowStore.workflows;
		if (wfid) {
			let wf=_.find(workflows, {workflow_id: wfid});
			if (wf) {
				WorkflowActions.showWorkflow(wfid, wf);
			}
		}
	},

  /*
  ### Description
  showing workflow metadata in a modal
  */
	showWorkflowMetadata: function(e) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
    let workflows=dataItem ? workflowStore.dataWorkflows[dataItem] : workflowStore.workflows;
		if (wfid) {
			let wf=_.find(workflows, {workflow_id: wfid});
			if (wf && wf.metadata_id) {
				WorkflowActions.showWorkflowMetadata(wfid);
			}
		}
	},
  
  /*
  ### Description
  showing workflow diagram in a modal
  */
  showWorkflowDiagram: function(e) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
    let table=this.refs.table;
    let wfid=table.store.getSelectedRowKeys()[0];
    let workflows=dataItem ? workflowStore.dataWorkflows[dataItem] : workflowStore.workflows;
    if (wfid) {
      let wf=_.find(workflows, {workflow_id: wfid});
      if (wf) {
        WorkflowActions.showWorkflowDiagram(wfid, wf);
      }
    }
  },

  /*
  ### Description
  delete workflow from user workflow table widget
  */
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

  /*
  ### Description
  create download of workflow json file
  */
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

  /*
  ### Description
  create a url in modal for sharing workflow
  */
	handleShare: function(e) {
		let table=this.refs.table;
		let wfid=table.store.getSelectedRowKeys()[0];
		if (wfid) {
			let url=window.location.protocol + "//" + window.location.host + '/?wf_id=' + wfid;
			let input=<Input id='copy' name='copy' value={url} type='textarea' readOnly />
			let copyBtn={
				label: 'Copy to clipboard',
				className: 'btn-primary',
				func: () => {
					let dom=document.getElementById('copy');
					dom.select();
					document.execCommand('Copy');
				}
			};
			this.refs.dialog.show({
				title: 'Workflow URL for sharing',
				body: input,
				actions: [
					copyBtn,
					Dialog.OKAction()
				],
				bsSize: 'medium'
			});
		}
	},

  /*
  ### Description
  update workflow data
  */
	handleCellSave: function(row, cellName, cellValue) {
		let formData=_.pick(row, ['workflow_id', 'name', 'description']);
		WorkflowActions.updateWorkflow(formData);
	},

	actionsFormatter: function(cell, row) {
		return cell;
	},

	createCustomButtonGroup: function(props) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
		let tooltipload=<Tooltip id="tooltipload">Load</Tooltip>;
		let tooltipdownload=<Tooltip id="tooltipdownload">Download</Tooltip>;
		let tooltipdelete=<Tooltip id="tooltipdelete">Delete</Tooltip>;
    let buttonGroup=dataItem ? (
			<ButtonGroup>
				<Button key='relaunch' bsStyle='success' onClick={this.handleRelaunch}><Glyphicon glyph='repeat'/> Relaunch</Button>
        <Button key='view' bsStyle='info' onClick={this.showWorkflowDiagram}><Glyphicon glyph='modal-window'/> Visualize</Button>
				<Button key='load' bsStyle='warning' onClick={this.handleLoad}><Glyphicon glyph='hand-right'/> Load</Button>
        <Button key='share' bsStyle='primary' onClick={this.handleShare}><Glyphicon glyph='share'/> Share</Button>
        <Button key='metadata' bsStyle='info' onClick={this.showWorkflowMetadata}><Glyphicon glyph='tags'/>  Metadata</Button>
			</ButtonGroup>
    ) : (
			<ButtonGroup>
				<Button key='relaunch' bsStyle='success' onClick={this.handleRelaunch}><Glyphicon glyph='repeat'/> Relaunch</Button>
        <Button key='view' bsStyle='info' onClick={this.showWorkflowDiagram}><Glyphicon glyph='modal-window'/> Visualize</Button>
				<Button key='load' bsStyle='warning' onClick={this.handleLoad}><Glyphicon glyph='hand-right'/> Load</Button>
        <Button key='share' bsStyle='primary' onClick={this.handleShare}><Glyphicon glyph='share'/> Share</Button>
				<Button key='delete' bsStyle='danger' onClick={this.handleDeleteRow}><Glyphicon glyph='trash'/> Delete</Button>
			</ButtonGroup>
    );
		return buttonGroup;
	},

  getWorkflows: function(fromStore) {
		let workflowStore=this.state.workflowStore;
    let dataItem=workflowStore.dataItem;
    let workflows=[];
    if (! fromStore && this.state.workflows) {
      workflows=this.state.workflows;
    } else if (dataItem) {
      if (workflowStore.dataWorkflows[dataItem]) {
        workflows=workflowStore.dataWorkflows[dataItem];
      }
    } else if (workflowStore.workflows.length) {
      workflows=workflowStore.workflows;
    }
    return {
      workflows: workflows,
      dataItem: dataItem
    }
  },

  onSearchChange: function(searchText, colInfos, multiColumnSearch) {
    const regex=/(\S*?"[^"]*"\S*)|\s+/;
    let tokens=searchText.trim().split(regex).filter(token => token).map(token => token.replace(/"/g, "").toLowerCase());
    let tokenCount = tokens.length;
    if (tokenCount === 0) {
      this.setState({
        workflows: undefined
      });
      return;
    }

    let workflows=this.getWorkflows(true).workflows;
    let filtered=workflows.filter((wf) => {
      let valid=false;
      _.values(wf).forEach(function(val) {
        if (val == undefined || val === "") {
          return;
        } else if (_.isObject(val)) {
          val=JSON.stringify(val);
        } else {
          val=val.toString().toLowerCase();
        }
        for (let i = 0; i < tokenCount; i++) {
          if (val.indexOf(tokens[i]) == -1) {
            return;
          }
        }
        valid=true;
        return;
      });
      return valid;
    });
    this.setState({
      workflows: filtered
    });
  },

  remote: function(remoteObj) {
    remoteObj.search=true;
    return remoteObj;
  },

	render: function() {
		let workflowItems=[];
    let inputs=this.getWorkflows();
    let workflows=inputs.workflows;
    let dataItem=inputs.dataItem;

    if (workflows && workflows.length) {
			workflowItems=workflows.map(function(workflow, i) {
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
      searchDelayTime: 200,
      onSearchChange: this.onSearchChange,
			btnGroup: this.createCustomButtonGroup
		};
    let header=dataItem ? dataItem.replace(/_+/gi, ' ') : "My Workflows";
		return (
			<Panel header={header}>
				<BootstrapTable ref='table' data={workflowItems} remote={this.remote} search={true} striped={true} hover={true} cellEdit={cellEditProp} pagination={true} selectRow={selectRowProp} options={options}>
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
