'use strict';

import React from 'react';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {ListGroupItem, Button, ButtonToolbar} from 'react-bootstrap';

var JobsItem=React.createClass({

	showJobDetail: function() {
		AgaveWebActions.showAgaveWebJobs(this.props.data.id);
	},

	render: function() {
		let displayName=this.props.index + ': ' + this.props.data.appId;
		let isSubmitting=undefined === this.props.data.id;

		return (
			<ListGroupItem>
				<ButtonToolbar>
					<Button key='displayName' bsSize='small' bsStyle='link' >{displayName}</Button>
					<Button key='status' disabled={isSubmitting} bsSize='xsmall' bsStyle='info' onClick={isSubmitting ? null : this.showJobDetail} >Status</Button>
				</ButtonToolbar>
			</ListGroupItem>
		);
	}
});

module.exports= JobsItem;

