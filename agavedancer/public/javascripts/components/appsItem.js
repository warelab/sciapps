'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroupItem} from 'react-bootstrap';

var AppsItem=React.createClass({

	showApp: function() {
		AgaveWebActions.showAgaveWebApps(this.props.data.id);
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
