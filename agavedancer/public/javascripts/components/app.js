'use strict';

require('../../styles/layout.less');

import React from 'react';
import Reflux from 'reflux';
import UserStore from '../stores/userStore.js';
import UserActions from  '../actions/userActions.js';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Layout, Fixed, Flex} from 'react-layout-pane';
import {Panel, Well, Button} from 'react-bootstrap';
import AppsGroup from './appsGroup.js';
import AppsDetail from './appsDetail.js';
import AppsSearchBox from './appsSearchBox.js';
import JobsList from './jobsList.js';
import JobsStore from '../stores/jobsStore.js';
import JobsDetail from './jobsDetail.js';
import DsDetail from './dsDetail.js';
import WorkflowDiagram from './workflowDiagram.js';
import Header from './header.js';
import UserLoginBox from './userLoginBox.js';

const App=React.createClass({
	mixins: [Reflux.connect(UserStore, 'userStore'), Reflux.connect(JobsStore, 'jobsStore')],

	componentWillMount: function() {
		UserStore.login();
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

	componentDidMount: function () {
		let app_id=_config.app_id, wf_id=_config.wf_id, page_id=_config.page_id || 'welcome';
		if (wf_id) {
			AppsActions.showPage('workflowRunner');
			WorkflowActions.showWorkflow(wf_id);
		} else if (app_id) {
			AppsActions.showApp(app_id);
		} else {
			AppsActions.showPage(page_id);
		}
	},

	render: function () {
		let user=this.state.userStore;
		let numJobs=this.state.jobsStore.jobs.length;
		let message, msgbtn;
		if (numJobs>0) {
			message="Total " + numJobs + " jobs, select 2 or more jobs to ";
			msgbtn=<Button bsStyle='link' onClick={this.showWorkflowBuilder}>build a workflow</Button>;
		} else {
			message="History is empty. You can start with submitting a new job or loading a ";
			msgbtn=<Button bsStyle='link' onClick={this.showWorkflows}>public workflow</Button>;
		}

		return (
			<Layout type="column">
				<Header user={user} />
				<UserLoginBox />
				<Flex>
					<Layout type="row">
						<Fixed className="leftbar">
              <Fixed className="apps-panel-header">Apps</Fixed>
							<Fixed className="search-wrapper"><AppsSearchBox /></Fixed>
							<AppsGroup user={user} />
						</Fixed>
						<Flex className="main">
							<AppsDetail user={user} />
							<DsDetail user={user} />
							<WorkflowDiagram user={user} />
						</Flex>
						<Fixed className="rightbar">
							<Fixed className="apps-panel-header">History</Fixed>
							<div className="info-message">{message}{msgbtn}</div>
							<JobsList user={user} />
							<JobsDetail user={user} />
						</Fixed>
					</Layout>
				</Flex>
			</Layout>
		);
	}
});

module.exports = App;
