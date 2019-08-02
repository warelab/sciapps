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
	
 	sortSubmitDates (a, b, order) {
    		let indices = [6, 7, 8, 9, 3, 4, 0, 1, 12, 13, 15, 16, 18, 19];
    		if (order === 'asc') {
      			let r = 0;
      			indices.find(i => r = a.remoteSubmitted.charCodeAt(i) - b.remoteSubmitted.charCodeAt(i));
      			return r;
    		} else if (order === 'desc') {
      			let r = 0;
      			indices.find(i => r = b.remoteSubmitted.toString().charCodeAt(i) - a.remoteSubmitted.toString().charCodeAt(i));
      			return r;
    		}
  	},

        sortEndDates (a, b, order) {
                let indices = [6, 7, 8, 9, 3, 4, 0, 1, 12, 13, 15, 16, 18, 19];
                if (order === 'asc') {
                        let r = 0;
                        indices.find(i => r = a.remoteEnded.charCodeAt(i) - b.remoteEnded.charCodeAt(i));
                        return r;
                } else if (order === 'desc') {
                        let r = 0;
                        indices.find(i => r = b.remoteEnded.toString().charCodeAt(i) - a.remoteEnded.toString().charCodeAt(i));
                        return r;
                }
        },

	handleLoad: function(e) {
		let table=this.refs.table;
		let jobIds=table.store.getSelectedRowKeys();
		if (jobIds && jobIds.length) {
			JobsActions.setJobs(jobIds);
		}
	},

	handleRefresh: function(e) {
		JobsActions.listJob();
	},

	handleDeleteRow: function(e) {
		let table=this.refs.table;
		let jobIds=table.store.getSelectedRowKeys();
		if (jobIds && jobIds.length) {
			this.handleConfirmDeleteRow(function() {
				table.store.setSelectedRowKey([]);
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
				<Button key='load' bsStyle='success' onClick={this.handleLoad}><Glyphicon glyph='hand-right'/> Load</Button>
				<Button key='refresh' bsStyle='warning' onClick={this.handleRefresh}><Glyphicon glyph='refresh'/> Refresh</Button>
				<Button key='delete' bsStyle='danger' onClick={this.handleDeleteRow}><Glyphicon glyph='trash'/> Delete</Button>
			</ButtonGroup>
		);
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let jobsItems;
    let headers=['remoteSubmitted', 'remoteEnded'];
		if (jobsStore.joblist.length) {
			jobsItems=jobsStore.joblist.map(function(job, i) {
        let j=_.clone(job);
        headers.forEach(function(h) {
          if (j[h]) {
            j[h]=utilities.transformDateTime(j[h]);
          }
        });
				return j;
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
					<TableHeaderColumn dataField="agave_id" hidden={true}>Agave ID</TableHeaderColumn>
					<TableHeaderColumn dataField="app_id" dataAlign="left" dataSort={true}>App Name</TableHeaderColumn>
					<TableHeaderColumn dataField="remoteSubmitted" dataAlign="center" width="155" dataSort={true} sortFunc={ this.sortSubmitDates }>Submit Time</TableHeaderColumn>
					<TableHeaderColumn dataField="remoteEnded" dataAlign="center" width="155" dataSort={true} sortFunc={ this.sortEndDates }>End Time</TableHeaderColumn>
        	<TableHeaderColumn dataField="status" dataAlign="center" width="88" dataSort={true}>Status</TableHeaderColumn>
				</BootstrapTable>
				<Dialog ref='dialog' />
			</Panel>
		);
	}
});

module.exports = UserJobs;

