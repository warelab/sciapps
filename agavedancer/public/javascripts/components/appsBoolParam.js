'use strict';

import React from 'react';
import _ from 'lodash';
import {Input, Button, ButtonGroup} from 'react-bootstrap';

const AppsBoolParam=React.createClass({
	TRUE: 'Yes',
	FALSE: 'No',

	getInitialState: function() {
		return {
			value: this.props.reload === 'resubmit' || this.props.data.value !== undefined ? this.props.data.value : this.props.data.default
		};
	},

	componentWillReceiveProps: function(nextProps) {
		let reload=nextProps.reload;
		if (reload === 'resubmit') {
			this.setState({value: nextProps.data.value ? 1 : 0});
		} else if (reload === 'default') {
			this.setState({value: nextProps.data.default ? 1 : 0});
		}
	},

	componentWillUnmount: function() {
		this.setState({value: this.props.data.default});
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
		let value=this.state.value;
		if (value === '0') {
			value=0;
		}
		value=value ? 1 : 0;
		let props=_.assign(_.pick(data, ['label', 'help']), {
			wrapperClassName: 'wrapper'
		});
		let hiddenProps=_.assign(_.pick(data, ['name', 'key']), {
			type: 'hidden',
			value: value
		});
		markup=(
			<div>
				<Input {...props} >
					<Input {...hiddenProps} />
					<ButtonGroup>
						<Button bsStyle={value ? 'primary' : undefined} active={value ? true : false} onClick={this.handleBtn} >{this.TRUE}</Button>
						<Button bsStyle={value ? undefined : 'warning'} active={value ? false : true} onClick={this.handleBtn} >{this.FALSE}</Button>
					</ButtonGroup>
				</Input>
			</div>
		);
		return markup;
	}
});

module.exports = AppsBoolParam;
