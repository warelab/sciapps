'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsStore from '../stores/appsStore.js';
import AppsActions from '../actions/appsActions.js';
import {Input, Button, Glyphicon, Well} from 'react-bootstrap';

const AppsSearchBox=React.createClass({
	getInitialState: function() {
		return {
			value: ''
		};
	},

	handleValueChange: function(event) {
		AppsActions.debouncedListApps(event.target.value);
		this.setState({value: event.target.value});
	},

	handleValueClear: function() {
		this.setState({value: ''});
		AppsActions.listApps();
	},

	render: function() {
		let resetButton=<Button onClick={this.handleValueClear}>Clear</Button>;
		let props={
			type: 'text',
			value: this.state.value,
			className: 'search-box',
			standalone: true,
			placeholder: 'search apps',
			buttonAfter: resetButton,
			onChange: this.handleValueChange
		}
		let markup=(
			<Input {...props} />
		);
		return markup;
	}
});

module.exports = AppsSearchBox;
