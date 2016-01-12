'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroupItem, Label} from 'react-bootstrap';

var JobsItem=React.createClass({

	showJobDetail: function() {
		AgaveWebActions.showAgaveWebJobs(this.props.data.id);
	},

	render: function() {
		let appId=this.props.data.appId;
		let displayName=appId ? this.props.data.submitNumber + ': ' + appId : 'Job submission failed!';
		return (
			<ListGroupItem onClick={this.showJobDetail}>
				<h4><Label bsStyle={appId ? 'default' : 'warning'} >
					{displayName}
				</Label></h4>
			</ListGroupItem>
		);
	}
});

module.exports= JobsItem;

