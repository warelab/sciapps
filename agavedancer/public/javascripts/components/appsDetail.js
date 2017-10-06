'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsStore from '../stores/appsStore.js';
import AppsActions from '../actions/appsActions.js';
import dsActions from '../actions/dsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Panel, Table, Jumbotron} from 'react-bootstrap';
import AppsInfo from './appsInfo.js';
import AppsForm from './appsForm.js';
import Welcome from './welcome.js';
import UserWorkflows from './userWorkflows.js';
import Workflows from './workflows.js';
import WorkflowBuilder from './workflowBuilder.js';
import WorkflowRunner from './workflowRunner.js';
import Help from './help.js';

const AppsDetail=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore')],

	componentDidMount: function() {
		AppsActions.setReload();
	},

	componentDidUpdate: function(prevProps, prevState) {
		AppsActions.setReload();
	},

	componentWillUnmount: function() {
		AppsActions.hideApp();
	},

	render: function() {
		let user=this.props.user;
		let appsStore=this.state.appsStore;
		let appDetail=appsStore.appDetail;
		let reload=appsStore.reload;
		let markup;
		//if (! this.props.user.logged_in) {
		//	markup=<Welcome />
		//} else if (appDetail && appDetail.id) {
		if (appDetail && appDetail.id) {
			markup=(
				<div>
					<AppsForm appDetail={appDetail} reload={reload} user={this.props.user}/>
					<AppsInfo appDetail={appDetail} />
				</div>
			);
		} else {
			switch (appsStore.pageId) {
				case 'userWorkflows':
					markup=<UserWorkflows user={user} />
					break;
				case 'workflows':
					markup=<Workflows />
					break;
				case 'workflowBuilder':
					markup=<WorkflowBuilder user={user} />
					break;
				case 'workflowRunner':
					markup=<WorkflowRunner user={user} />
					break;
				case 'welcome':
					markup=<Welcome />
					break;
				case 'help':
					markup=<Help />
					break;
				default:
					markup=<div />
			}
		}
		return markup;
	}
});

module.exports = AppsDetail;
