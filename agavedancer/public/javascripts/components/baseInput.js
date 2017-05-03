'use strict';

import React from 'react';
import _ from 'lodash';
import {Input} from 'react-bootstrap';

const BaseInput=React.createClass({
	getInitialState: function() {
		return {value: this.props.data.value};
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.data.value !== undefined) {
			this.setState({
				value: nextProps.data.value
			});
		}
	},

	componentWillUnmount: function() {
		this.setState({value: this.props.data.value});
	},

	handleChange: function(event) {
		let currValue=this.state.value;
		let nextValue=this.props.data.type === 'checkbox' ? ! currValue : event.target.value;
		this.setState({value: nextValue});
	},

	validateState: function() {
		if (this.props.data.required && ! this.state.value.toString().length) return 'warning';
		else return undefined;
	},

	render: function() {
		let data=_.cloneDeep(this.props.data), isSelect=this.props.isSelect, options=_.cloneDeep(this.props.options), markup;
		_.assign(data, {
			value: this.state.value,
			bsStyle: this.props.onValidate ? this.validateState() : undefined,
			onChange: this.handleChange
		});
		if (data.type === 'checkbox') {
			data.checked=this.state.value;
		}
		if (isSelect) {
			let optionsMarkup=options.map(function(option, i) {
				return(
					<option key={i} value={option.optionValue} >
						{option.optionChild}
					</option>
				);
			});
			markup=(
				<Input {...data} >
					{optionsMarkup}
				</Input>
			);
		} else {
			markup=(<Input {...data} />);
		}
		return markup;
	}
});

module.exports = BaseInput;
