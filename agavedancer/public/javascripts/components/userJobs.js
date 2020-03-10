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

  getInitialState: function() {
    return {
      jobs: undefined
    }
  },
	
  /*
  ### Description
  sort jobs by submit date
  */
 	sortSubmitDates (a, b, order) {
		if (a.remoteSubmitted === undefined)
			return 1;
		else if (b.remoteSubmitted === undefined)
			return -1;
			
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

  /*
  ### Description
  sort jobs by end date
  */
        sortEndDates (a, b, order) {
                if (a.remoteSubmitted === undefined)
                        return 1;
                else if (b.remoteSubmitted === undefined)
                        return -1;

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

  /*
  ### Description
  load job to history panel
  */
	handleLoad: function(e) {
		let table=this.refs.table;
		let jobIds=table.store.getSelectedRowKeys();
		if (jobIds && jobIds.length) {
			JobsActions.setJobs(jobIds);
		}
	},

  /*
  ### Description
  refresh the user job table widgt
  */
	handleRefresh: function(e) {
		JobsActions.listJob();
	},

  /*
  ### Description
  delate job from user job table
  */
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

  getJobs: function(fromStore) {
		let jobsStore=this.state.jobsStore;
    let jobs=[];
    if (! fromStore && this.state.jobs) {
      jobs=this.state.jobs;
    } else if (jobsStore.joblist.length) {
			jobs=jobsStore.joblist;
    }
    return {
      jobs: jobs
    }
  },

  onSearchChange: function(searchText, colInfos, multiColumnSearch) {
    const regex=/(\S*?"[^"]*"\S*)|\s+/;
    let tokens=searchText.trim().split(regex).filter(token => token).map(token => token.replace(/"/g, "").toLowerCase());
    let tokenCount = tokens.length;
    if (tokenCount === 0) {
      this.setState({
        jobs: undefined
      });
      return;
    }

    let jobs=this.getJobs(true).jobs;
    let filtered=jobs.filter((job) => {
      let valid=false;
      _.values(job).forEach(function(val) {
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
      jobs: filtered
    });
  },

  remote: function(remoteObj) {
    remoteObj.search=true;
    return remoteObj;
  },

	render: function() {
		let jobsItems=[];
    let inputs=this.getJobs();
    let jobs=inputs.jobs;
    let headers=['remoteSubmitted', 'remoteEnded'];
    
		if (jobs && jobs.length) {
			jobsItems=jobs.map(function(job, i) {
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
      searchDelayTime: 200,
      onSearchChange: this.onSearchChange,
			btnGroup: this.createCustomButtonGroup
		};
		return (
			<Panel header="My Jobs">
				<BootstrapTable ref='table' data={jobsItems} remote={this.remote} search={true} striped={true} hover={true} pagination={true} selectRow={selectRowProp} options={options}>
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

