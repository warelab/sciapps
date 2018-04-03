'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import JobsStore from '../stores/jobsStore.js';
import JobsActions from  '../actions/jobsActions.js';
import AppsActions from  '../actions/appsActions.js';
import {Button} from 'react-bootstrap';

const JobsMessage=React.createClass({
	//mixins: [Reflux.connect(JobsStore, 'jobsStore')],
	mixins: [Reflux.listenTo(JobsStore, 'handleJobsStoreChange')],

	getInitialState: function() {
		return {jobsNum: 0};
	},

	handleJobsStoreChange: function(jobsStore) {
		this.setState({jobsNum: jobsStore.jobs.length});
	},

	showWorkflows: function() {
		AppsActions.showPage('workflows');
		let title="Public Workflows";
		let url="/?page_id=workflows";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	showWorkflowBuilder: function() {
		AppsActions.showPage('workflowBuilder');
		let title="Building Scientific Workflows";
		let url="/?page_id=workflowBuilder";
		if (typeof (history.pushState) !== "undefined") {
			let obj = { Title: title, Url: url };
			history.pushState(obj, obj.Title, obj.Url);
		} else {
			alert("Browser does not support HTML5.");
		}
	},

	render: function () {
		let jobsNum=this.state.jobsNum;
		let message;
		if (jobsNum) {
			message=<span>{"Total " + jobsNum + " jobs, select 2 or more jobs to "}<Button bsStyle='link' onClick={this.showWorkflowBuilder}>build a workflow</Button></span>;
		} else {
			message=<span>{"History is empty. You can start with a "}<Button bsStyle='link' onClick={this.showWorkflows}>public workflow</Button></span>;
		}
		let markup=(
			<div className="info-message">{message}</div>
		);
		return markup;
	}
});

module.exports = JobsMessage;
