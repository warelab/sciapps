'use strict';

import React from 'react';
import AppsItem from './appsItem.js';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

var JobsList=React.createClass({

	componentWillMount: function() {
		AgaveWebActions.listAgaveWebJobs();
	},

	render: function() {
		var app_form, app_info;
		return (
			<ListGroup>
				<ListGroupItem>job1</ListGroupItem>
				<ListGroupItem>job2</ListGroupItem>
			</ListGroup>
		);
	}
});

module.exports = JobsList;
