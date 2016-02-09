'use strict';

import React from 'react';
import Reflux from 'reflux';
import SettingsActions from '../actions/settingsActions.js';
import {Layout, Fixed, Flex} from 'react-layout-pane';
import AppsList from './appsList.js';
import AppsDetail from './appsDetail.js';
import JobsList from './jobsList.js';
import JobsDetail from './jobsDetail.js';
import DsDetail from './dsDetail.js';

const App=React.createClass({

	componentWillMount: function () {
		SettingsActions.getSettings();
	},

	render: function () {
		return (
					<Layout type="row">
						<Fixed className="leftbar">
							<AppsList />
						</Fixed>
						<Flex className="main">
							<AppsDetail />
							<DsDetail />
						</Flex>
						<Fixed className="rightbar">
							<JobsList />
							<JobsDetail />
						</Fixed>
					</Layout>
		);
	}
});

module.exports = App;
