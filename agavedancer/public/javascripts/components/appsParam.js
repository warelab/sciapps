'use strict';

import React from 'react';
import _ from 'lodash';
import {Input} from 'react-bootstrap';

const AgaveAppsParam=React.createClass({
	getInitialState: function() {
		return {value: this.props.data.value.default};
	},
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	buildAgaveAppsParamProps: function(param) {
		let props={
			value: this.state.value
		};
		if (! param.value.visible) {
			props.type='hidden';
		} else {
			props=_.assign(props, {
				label: param.details.label,
				placeholder: param.value.default,
				help: param.details.description
			});
			let addProps;
			switch (param.type) {
				case 'bool':
				case 'boolean':
				case 'flag':
					addProps={
						type: 'checkbox',
						checked: this.state.value
					};
					break;
				case 'number':
				case 'string':
				case 'enumeration':
					addProps={
						type: 'text'
					};
					break;
				default:
			}
			props=_.assign(props, addProps);
		}
	},
	render: function() {
		let props=this.buildAgaveAppsParamProps(this.props.data);
		return (
			<Input {...props} />
		);
	}
});

module.exports = AgaveAppsParam;
