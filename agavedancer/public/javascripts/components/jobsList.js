'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import JobsActions from '../actions/jobsActions.js';
import JobsStore from '../stores/jobsStore.js';
import JobsItem from './jobsItem.js';
import {ListGroup} from 'react-bootstrap';

const JobsList=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore')],

	getInitialState: function() {
		return { setting: _config.setting };
	},

	componentDidMount: function() {
		JobsActions.listJobs();
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let setting=this.state.setting;
		let jobs, jobOutputs, jobsItemNodes;
		jobs=jobsStore.jobs;
		jobOutputs=jobsStore.jobOutputs;
		if (jobs && jobs.length) {
			jobsItemNodes = jobs.map(function (jobsItem, index) {
				let outputs=jobOutputs[jobsItem.job_id];
				let checked=jobsStore.workflowBuilderJobIndex[index];
				return (
					<JobsItem key={index} data={jobsItem} index={index} setting={setting} outputs={outputs} checked={checked}/>
				);
			});
		}

		return (
			<ListGroup>
				{jobsItemNodes}
			</ListGroup>
		);
	}
});

module.exports = JobsList;
