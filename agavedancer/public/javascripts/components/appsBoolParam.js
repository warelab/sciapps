'use strict';

import React from 'react';
import _ from 'lodash';
import {Input, Button, ButtonGroup} from 'react-bootstrap';

const AppsBoolParam=React.createClass({
	TRUE: 'Yes',
	FALSE: 'No',

	getInitialState: function() {
		return {
			value: this.props.data.value ? 1 : 0
		};
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			value: nextProps.data.value ? 1 : 0
		});
	},

	componentWillUnmount: function() {
		this.setState({value: this.props.data.value});
	},

	handleBtn: function(event) {
		switch(event.target.textContent) {
			case this.TRUE:
				this.setState({value: 1});
				break;
			case this.FALSE:
				this.setState({value: 0});
				break;
		}
	},

	render: function() {
		let data=this.props.data, markup;
		let props=_.assign(_.pick(data, 'label'), {
			wrapperClassName: 'wrapper'
		});
		let hiddenProps=_.assign(_.pick(data, ['name', 'key']), {
			type: 'hidden',
			value: this.state.value
		});
		markup=(
			<div>
				<Input {...props} >
					<Input {...hiddenProps} />
				</Input>
				<ButtonGroup>
					<Button bsStyle={this.state.value ? 'primary' : undefined} active={this.state.value ? true : false} onClick={this.handleBtn} >{this.TRUE}</Button>
					<Button bsStyle={this.state.value ? undefined : 'warning'} active={this.state.value ? false : true} onClick={this.handleBtn} >{this.FALSE}</Button>
				</ButtonGroup>
			</div>
		);
		return markup;
	}
});

module.exports = AppsBoolParam;
