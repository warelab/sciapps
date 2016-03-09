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
		let jobs, jobResults, jobsItemNodes;
		jobs=jobsStore.jobs;
		jobResults=jobsStore.jobResults;
		if (jobs && jobs.length) {
			jobsItemNodes = jobs.map(function (jobsItem, index) {
				let results=_.get(jobResults, jobsItem.id);
				return (
					<JobsItem key={index} data={jobsItem} index={index} setting={setting} results={results} />
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
