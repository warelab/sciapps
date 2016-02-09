'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsStore from '../stores/appsStore.js';
import AppsActions from '../actions/appsActions.js';
import AppsItem from './appsItem.js';
import {ListGroup} from 'react-bootstrap';

const AppsList=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore')],

	componentDidMount: function() {
		AppsActions.listApps();
	},
	
	render: function() {
		let appsStore=this.state.appsStore;
		let apps, appsItemNodes;
		apps=appsStore.apps;
		if (apps && apps.length) {
			appsItemNodes = apps.map(function (appsItem) {
				return (
					<AppsItem key={appsItem.id} data={appsItem} />
				);
			});
		}

		return (
			<ListGroup>
				{appsItemNodes}
			</ListGroup>
		);
	}
});

module.exports = AppsList;
