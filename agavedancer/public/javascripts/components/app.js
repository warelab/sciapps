'use strict';

import React from 'react';
import Reflux from 'reflux';
import AgaveWebActions from '../actions/agaveWebActions.js';
import AgaveWebStore from '../stores/agaveWebStore.js';
import {Layout, Fixed, Flex} from 'react-layout-pane';
import AppsList from './appsList.js';
import AppsDetail from './appsDetail.js';
import JobsList from './jobsList.js';

var App=React.createClass({
	mixins: [Reflux.connect(AgaveWebStore, 'agave')],

	render: function () {
		var agave=this.state.agave;

		return (
			<Layout type="column">
				<Fixed className="header">
					Header
				</Fixed>
				<Flex>
					<Layout type="row">
						<Fixed className="sidebar">
							<AppsList apps={agave.apps} />
						</Fixed>
						<Flex className="main">
							<AppsDetail appDetail={agave.appDetail} />
						</Flex>
						<Fixed className="sidebar">
							<JobsList jobs={agave.jobs} />
						</Fixed>
					</Layout>
				</Flex>
				<Fixed className="header">
					Footer
				</Fixed>
			</Layout>
		);
	}
});

module.exports = App;
