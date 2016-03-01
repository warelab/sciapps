'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsItem from './appsItem.js';
import {ListGroup} from 'react-bootstrap';

const AppsList=React.createClass({
	render: function() {
		let apps, appsItemNodes;
		apps=this.props.apps;
		if (apps && apps.length) {
			appsItemNodes = apps.sort(function (a, b) {
				return a.name.localeCompare(b.name);
			}).map(function (appsItem) {
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
