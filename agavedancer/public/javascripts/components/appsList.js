'use strict';

import React from 'react';
import AppsItem from './appsItem.js';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroup} from 'react-bootstrap';

var AppsList=React.createClass({

	componentDidMount: function() {
		AgaveWebActions.listAgaveWebApps();
	},
	
	render: function() {
		var apps, appsItemNodes;
		apps=this.props.apps;
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
