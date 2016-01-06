'use strict';

import React from 'react';
import Reflux from 'reflux';
import AgaveWebActions from '../actions/agaveWebActions.js';
import AgaveWebStore from '../stores/agaveWebStore.js';
import {Layout, Fixed, Flex} from 'react-layout-pane';
import AppsList from './appsList.js';
import AppsDetail from './appsDetail.js';
import JobsList from './jobsList.js';
import JobsDetail from './jobsDetail.js';

var App=React.createClass({
	mixins: [Reflux.connect(AgaveWebStore, 'agave')],

	componentWillMount: function () {
		AgaveWebActions.setupAgaveWebApps();
	},

	render: function () {
		let agave=this.state.agave;

		return (
					<Layout type="row">
						<Fixed className="leftbar">
							<AppsList apps={agave.apps} settings={agave.settings} />
						</Fixed>
						<Flex className="main">
							<AppsDetail appDetail={agave.appDetail} settings={agave.settings} />
						</Flex>
						<Fixed className="rightbar">
							<JobsList jobs={agave.jobs} settings={agave.settings} />
							<JobsDetail jobDetail={agave.jobDetail} settings={agave.settings} />
						</Fixed>
					</Layout>
		);
	}
});

module.exports = App;
