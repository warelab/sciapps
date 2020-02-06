'use strict';

import React from 'react';
import _ from 'lodash';
import {Input} from 'react-bootstrap';

const BaseInput=React.createClass({
	getInitialState: function() {
		return {value: this.props.reload === 'resubmit' || this.props.data.value !== undefined ? this.props.data.value : this.props.data.default};
	},

  /*
  ### Description
  fill the value according to reload property; if it is 'resubmit', using job value; if it is 'default', using default value
  */
	componentWillReceiveProps: function(nextProps) {
		let reload=nextProps.reload;
		if (reload === 'resubmit') {
			this.setState({value: nextProps.data.value});
		} else if (reload === 'default') {
			this.setState({value: nextProps.data.default});
		}
	},

	componentWillUnmount: function() {
		this.setState({value: this.props.data.default});
	},

  /*
  ### Description
  handle text input and set input value
  */
	handleChange: function(event) {
		let currValue=this.state.value;
		let nextValue=this.props.data.type === 'checkbox' ? ! currValue : event.target.value;
		this.setState({value: nextValue});
	},

  /*
  ### Description
  validate requirement fulfilled or setup warning
  */
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
