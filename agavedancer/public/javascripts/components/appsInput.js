'use strict';

import React from 'react';
import _ from 'lodash';
import {Input} from 'react-bootstrap';

const AgaveAppsInput=React.createClass({
	getInitialState: function() {
		return {value: this.props.data.value.default};
	},
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	buildAgaveAppsInput: function(input) {
		let markup;
		let props={
			key: input.id,
			name: input.id,
			value: this.state.value
		};
		if (! input.value.visible) {
			props.type='hidden';
		} else {
			props=_.assign(props, {
				onChange: this.handleChange,
				label: input.details.label,
				placeholder: input.value.default,
				help: input.details.description
			});
			let addProps;
			addProps={
				type: 'text'
			};
			props=_.assign(props, addProps);
		}
		markup=(<Input {...props} />);
		return markup;
	},
	render: function() {
		let markup=this.buildAgaveAppsInput(this.props.data);
		return markup;
	}
});

module.exports = AgaveAppsInput;
