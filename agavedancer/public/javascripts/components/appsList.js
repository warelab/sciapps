'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsItem from './appsItem.js';
import {ListGroup} from 'react-bootstrap';
import _ from 'lodash';

const AppsList=React.createClass({
	render: function() {
		let apps, appsItemNodes;
		apps=this.props.apps;
		if (apps && apps.length) {
			appsItemNodes = _.uniq(_.sortBy(apps, 'id'), true, 'id').map(function (appsItem) {
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
