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
	buildAgaveAppsSelectOption: function(option) {
		var optionChild, optionProps;
		if (_.isString(option)) {
			optionProps={value: option};
			optionChild=option;
		} else {
			option=_.flatten(_.pairs(option));
			optionProps={value: option[0]};
			optionChild=option[1];
		}
		return (
			<option {...optionProps}>
				{optionChild}
			</option>
		);
	},
	buildAgaveAppsParam: function(param) {
		let markup, options, isSelect=false;
		let props={
			key: 'parameters.' + param.id,
			value: this.state.value
		};
		if (! param.value.visible) {
			props.type='hidden';
		} else {
			props=_.assign(props, {
				onChange: this.handleChange,
				label: param.details.label,
				placeholder: param.value.default,
				help: param.details.description
			});
			let addProps;
			switch (param.value.type) {
				case 'bool':
				case 'boolean':
				case 'flag':
					addProps={
						type: 'checkbox',
						checked: this.state.value
					};
					break;
				case 'enumeration':
					addProps={
						type: 'select'
					};
					isSelect=true;
					break;
				case 'number':
				case 'string':
					addProps={
						type: 'text'
					};
					break;
				default:
			}
			props=_.assign(props, addProps);
			if (isSelect) {
				options=param.value.enum_values.map(this.buildAgaveAppsSelectOption);
				markup=(
					<Input {...props}>
						{options}
					</Input>
				);
			} else {
				markup=(<Input {...props} />);
			}
		}
		return markup;
	},
	render: function() {
		let markup=this.buildAgaveAppsParam(this.props.data);
		return markup;
		//return (
		//	<Input {...props} />
		//);
	}
});

module.exports = AgaveAppsParam;
