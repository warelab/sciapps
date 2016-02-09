'use strict';

import React from 'react';
import AppsActions from '../actions/appsActions.js';
import {ListGroupItem} from 'react-bootstrap';

var AppsItem=React.createClass({

	showApp: function() {
		AppsActions.showApp(this.props.data.id);
	},

	render: function() {
		return (
			<ListGroupItem onClick={this.showApp}>
				{this.props.data.name}
			</ListGroupItem>
		);
	}
});

module.exports= AppsItem;
