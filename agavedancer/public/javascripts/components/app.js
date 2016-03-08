'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsActions from '../actions/appsActions.js';
import SettingsActions from '../actions/settingsActions.js';
import {Layout, Fixed, Flex} from 'react-layout-pane';
import {Panel, Well} from 'react-bootstrap';
import AppsGroup from './appsGroup.js';
import AppsDetail from './appsDetail.js';
import JobsList from './jobsList.js';
import JobsDetail from './jobsDetail.js';
import DsDetail from './dsDetail.js';
import Header from './header.js';

const App=React.createClass({

	componentWillMount: function () {
		SettingsActions.getSettings();
		let app_id=_config.app_id;
		if (app_id) {
			AppsActions.showApp(app_id);
		}
	},

	render: function () {
		return (
			<Layout type="column">
				<Header />
				<Flex>
					<Layout type="row">
						<Fixed className="leftbar">
							<div className="panel-heading"><h3 className="apps-panel-title">Apps</h3></div>
							<AppsGroup />
						</Fixed>
						<Flex className="main">
							<AppsDetail />
							<DsDetail />
						</Flex>
						<Fixed className="rightbar">
							<div className="panel-heading"><h3 className="jobs-panel-title">History</h3></div>
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
