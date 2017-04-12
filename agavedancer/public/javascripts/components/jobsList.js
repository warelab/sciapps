'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import AppsStore from '../stores/appsStore.js';
import JobsStore from '../stores/jobsStore.js';
import JobsActions from  '../actions/jobsActions.js';
import JobsItem from './jobsItem.js';
import {ListGroup} from 'react-bootstrap';

const JobsList=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(AppsStore, 'appsStore')],

	render: function() {
		let jobsStore=this.state.jobsStore;
		let appsStore=this.state.appsStore;
		let setting=_config.setting;
		let jobs, jobOutputs, jobsItemNodes;
		jobs=jobsStore.jobs;
		//if (this.props.user.logged_in && jobs && jobs.length) {
		if (jobs && jobs.length) {
			jobsItemNodes = jobs.map(function (jobsItem, index) {
				if (jobsItem) {
					let checked=jobsStore.workflowBuilderJobIndex[index];
					let app=appsStore.appDetailCache[jobsItem.appId];
					return (
						<JobsItem key={index} job={jobsItem} index={index} checked={checked} app={app}/>
					);
				} else {
					return undefined;
				}
			}).filter(function(jobsItem) {
				return jobsItem;
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
