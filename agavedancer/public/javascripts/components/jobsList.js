'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import AppsStore from '../stores/appsStore.js';
import JobsStore from '../stores/jobsStore.js';
import JobsActions from  '../actions/jobsActions.js';
import JobsItem from './jobsItem.js';
import {ListGroup, Panel, ButtonGroup, Button} from 'react-bootstrap';

const JobsList=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(AppsStore, 'appsStore')],

	render: function() {
		let jobsStore=this.state.jobsStore;
		let appsStore=this.state.appsStore;
		let setting=_config.setting;
		let markup=<div />;
		let jobs, jobOutputs, jobsItemNodes;
		jobs=jobsStore.jobs;
		//if (this.props.user.logged_in && jobs && jobs.length) {
		if (jobs && jobs.length) {
			jobsItemNodes = jobs.map(function (jobsItem, index) {
				if (jobsItem) {
					if (jobsItem.job_id) {
						jobsItem=jobsStore.jobDetailCache[jobsItem.job_id];
					}
					let app=appsStore.appDetailCache[jobsItem.appId];
					let outputIDs=undefined == app ? [] : _.map(app.outputs, "id");
					//let enableCheck=false;
					let enableCheck=true;
					let outputs=jobsStore.jobOutputs[jobsItem.job_id];
					let staged=jobsStore.jobOutputsStaged[jobsItem.job_id];
					if (outputs && outputs.length) {
						//enableCheck=true;
						_.remove(outputs, function(v) {
							return ! _.some(outputIDs, (oid) => {return _.startsWith(v.name, oid)});
						});
					}
					let checked=enableCheck && jobsStore.workflowBuilderJobIndex[index];
					return (
						<JobsItem key={index} job={jobsItem} index={index} checked={checked} enableCheck={enableCheck} app={app} outputs={outputs} staged={staged}/>
					);
				} else {
					return undefined;
				}
			}).filter(function(jobsItem) {
				return jobsItem;
			});
			markup=(
				<ListGroup>
					{jobsItemNodes}
				</ListGroup>
			);
		}

		return markup;
	}
});

module.exports = JobsList;
