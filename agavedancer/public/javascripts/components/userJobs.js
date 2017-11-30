'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Table, Button, ButtonToolbar, ButtonGroup, Tooltip, OverlayTrigger, Glyphicon} from 'react-bootstrap';
import JobsStore from '../stores/jobsStore.js';
import JobsActions from '../actions/jobsActions.js';
import Dialog from 'react-bootstrap-dialog';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import utilities from '../libs/utilities.js';

const UserJobs=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore')],

	handleLoad: function(e) {
		let table=this.refs.table;
		let jobIds=table.store.selected;
		if (jobIds && jobIds.length) {
			JobsActions.setJobs(jobIds);
		}
	},

	handleRefresh: function(e) {
		JobsActions.listJob();
	},

	handleDeleteRow: function(e) {
		let table=this.refs.table;
		let jobIds=table.store.selected;
		if (jobIds && jobIds.length) {
			this.handleConfirmDeleteRow(function() {
				JobsActions.deleteJobs(jobIds);
			});
		}
	},

	handleConfirmDeleteRow: function(next) {
		this.refs.dialog.show({
			body: 'Are you sure you want to delete the job(s)?',
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

	createCustomButtonGroup: function(props) {
		return (
			<ButtonGroup>
				<Button key='load' bsStyle='success' onClick={this.handleLoad}><Glyphicon glyph='repeat'/> Load</Button>
				<Button key='refresh' bsStyle='info' onClick={this.handleRefresh}><Glyphicon glyph='refresh'/> Refresh</Button>
				<Button key='delete' bsStyle='warning' onClick={this.handleDeleteRow}><Glyphicon glyph='trash'/> Delete</Button>
			</ButtonGroup>
		);
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let jobsItems;
		if (jobsStore.joblist.length) {
			jobsItems=jobsStore.joblist.map(function(job, i) {
				return job;
			});
		}
		let selectRowProp={
			mode: 'checkbox'
		};
		let options={
			btnGroup: this.createCustomButtonGroup
		};
		return (
			<Panel header="My Jobs">
				<BootstrapTable ref='table' data={jobsItems} search={true} striped={true} hover={true} pagination={true} selectRow={selectRowProp} options={options}>
					<TableHeaderColumn isKey={true} dataField="job_id" hidden={true}>ID</TableHeaderColumn>
					<TableHeaderColumn dataField="app_id" dataAlign="left" dataSort={true}>App Name</TableHeaderColumn>
					<TableHeaderColumn dataField="submitTime" dataAlign="center" width="155" dataSort={true}>Submit Time</TableHeaderColumn>
					<TableHeaderColumn dataField="endTime" dataAlign="center" width="155" dataSort={true}>End Time</TableHeaderColumn>
                                        <TableHeaderColumn dataField="status" dataAlign="center" width="88" dataSort={true}>Status</TableHeaderColumn>
				</BootstrapTable>
				<Dialog ref='dialog' />
			</Panel>
		);
	}
});

module.exports = UserJobs;

