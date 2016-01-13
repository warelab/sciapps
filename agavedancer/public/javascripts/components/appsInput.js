'use strict';

import React from 'react';
import _ from 'lodash';
import AgaveWebActions from '../actions/agaveWebActions.js';
import {Input, Button} from 'react-bootstrap';

const AppsInput=React.createClass({
	getInitialState: function() {
		return {
			textValue: this.props.data.value.default,
			fileValue: this.props.data.value.default
		};
	},

	handleTextChange: function(event) {
		this.setState({textValue: event.target.value});
	},

	handleFileChange: function(event) {
		this.setState({fileValue: event.target.value});
	},

	handleDataStore: function() {
		AgaveWebActions.showAgaveWebDataStore();
		//this.setState({textValue: });
	},

	buildAgaveAppsInput: function(data, settings, type) {
		let markup;
		let suffix=settings.upload_suffix;
		if (! data.value.visible) {
			let props={
				key: data.id,
				name: data.id,
				value: this.state.value,
				type: 'hidden'
			};
			markup=(<Input {...props} />);
		} else {
			let dataStoreButton=(
				<Button onClick={this.handleDataStore}>DataStore</Button>
			);
			let props={
				label: data.details.label,
				help: data.details.description,
				wrapperClassName: 'wrapper',
			};
			let textProps={
				key: data.id,
				name: data.id,
				value: this.state.textValue,
				type: 'text',
				placeholder: 'or Enter URL',
				buttonAfter: dataStoreButton, 
				className: 'form-control',
				wrapperClassName: 'col-xs-6',
				onChange: this.handleTextChange
			};
			let fileProps={
				key: data.id + suffix,
				name: data.id + suffix,
				value: this.state.fileValue,
				type: 'file',
				className: 'form-control',
				wrapperClassName: 'col-xs-6',
				onChange: this.handleFileChange
			};
			markup=(
				<Input {...props} >
					<Input {...fileProps} />
					<Input {...textProps} />
				</Input>
			);
		}
		return markup;
	},
	render: function() {
		let markup=this.buildAgaveAppsInput(this.props.data, this.props.settings);
		return markup;
	}
});

module.exports = AppsInput;
