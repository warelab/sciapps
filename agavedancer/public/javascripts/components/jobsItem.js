'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroupItem, Button} from 'react-bootstrap';

var JobsItem=React.createClass({

	showJobDetail: function() {
		AgaveWebActions.showAgaveWebJobs(this.props.data.id);
	},

	render: function() {
		let appId=this.props.data.appId;
		let displayName=appId ? this.props.data.submitNumber + ': ' + appId : 'Job submission failed!';
		return (
			<ListGroupItem onClick={this.showJobDetail}>
				<div className={(appId ? 'btn-default' : 'btn-warning') + ' btn-block'} >
					{displayName}
				</div>
			</ListGroupItem>
		);
	}
});

module.exports= JobsItem;

