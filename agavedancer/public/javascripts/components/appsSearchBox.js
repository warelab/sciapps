'use strict';

require('../../styles/layout.less');

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
		let props={
			type: 'text',
			value: this.state.value,
			className: 'app-search-box',
			standalone: true,
			placeholder: 'Search apps',
			onChange: this.handleValueChange
		}
		let markup=(
			<Input {...props} />
		);
		return markup;
	}
});

module.exports = AppsSearchBox;
