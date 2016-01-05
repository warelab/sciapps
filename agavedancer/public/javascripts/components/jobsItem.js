'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroupItem} from 'react-bootstrap';

var JobsItem=React.createClass({

	showJob: function() {
		AgaveWebActions.showAgaveWebJobs(this.props.data.id);
	},

	render: function() {
		return (
			<ListGroupItem onClick={this.showJob}>
				{this.props.data.name}
			</ListGroupItem>
		);
	}
});

module.exports= JobsItem;

