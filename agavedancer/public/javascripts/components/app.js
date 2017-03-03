'use strict';

require('../../styles/layout.less');


import React from 'react';
import Reflux from 'reflux';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import {Layout, Fixed, Flex} from 'react-layout-pane';
import {Panel, Well} from 'react-bootstrap';
import AppsGroup from './appsGroup.js';
import AppsDetail from './appsDetail.js';
import AppsSearchBox from './appsSearchBox.js';
import JobsList from './jobsList.js';
import JobsDetail from './jobsDetail.js';
import DsDetail from './dsDetail.js';
import WorkflowDiagram from './workflowDiagram.js';
import Header from './header.js';
import UserLoginBox from './userLoginBox.js';

const App=React.createClass({

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
		return (
			<Layout type="column">
				<Header />
				<UserLoginBox />
				<Flex>
					<Layout type="row">
						<Fixed className="leftbar">
              						<Fixed className="apps-panel-header">Apps</Fixed>
							<Fixed className="search-wrapper"><AppsSearchBox /></Fixed>
							<AppsGroup />
						</Fixed>
						<Flex className="main">
							<AppsDetail />
							<DsDetail />
							<WorkflowDiagram />
						</Flex>
						<Fixed className="rightbar">
							<Fixed className="apps-panel-header">History</Fixed>
							<JobsList />
							<JobsDetail />
						</Fixed>
					</Layout>
				</Flex>
			</Layout>
		);
	}
});

module.exports = App;
