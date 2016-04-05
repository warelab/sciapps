'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsStore from '../stores/appsStore.js';
import AppsActions from '../actions/appsActions.js';
import dsActions from '../actions/dsActions.js';
import {Panel, Table, Jumbotron} from 'react-bootstrap';
import AppsInfo from './appsInfo.js';
import AppsForm from './appsForm.js';
import Welcome from './welcome.js';
import Workflows from './workflows.js';
import BuildWorkflow from './buildWorkflow.js';

const AppsDetail=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore')],

	componentDidUpdate: function(prevProps, prevState) {
		dsActions.resetDsDetail();
	},

	render: function() {
		let appsStore=this.state.appsStore;
		let appDetail=appsStore.appDetail;
		let markup;
		if (appDetail.id) {
			markup=(
				<div>
					<AppsForm appDetail={appDetail} />
					<AppsInfo appDetail={appDetail} />
				</div>
			);
		} else {
			switch (appsStore.pageId) {
				case 'workflows':
					markup=<Workflows />
					break;
				case 'buildWorkflow':
					markup=<BuildWorkflow />
					break;
				case 'welcome':
					markup=<Welcome />
					break;
				default:
					markup=<div />
			}
		}
		return markup;
	}
});

module.exports = AppsDetail;
