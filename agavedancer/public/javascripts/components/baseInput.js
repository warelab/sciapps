'use strict';

import React from 'react';
import _ from 'lodash';
import {Input} from 'react-bootstrap';

const BaseInput=React.createClass({
	getInitialState: function() {
		return {value: this.props.data.value};
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			value: nextProps.data.value
		});
	},

	handleChange: function(event) {
		let nextValue=this.props.data.type === 'checkbox' ? ! this.state.value : event.target.value;
		this.setState({value: nextValue});
	},

	render: function() {
		let data=this.props.data, isSelect=this.props.isSelect, options=this.props.options, markup;
		data=_.assign(data, {
			value: this.state.value,
			onChange: this.handleChange
		});
		if (data.type === 'checkbox') {
			data.checked=this.state.value;
		}
		if (isSelect) {
			let optionsMarkup=options.map(function(option) {
				return(
					<option key={option.optionValue} value={option.optionValue} >
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
