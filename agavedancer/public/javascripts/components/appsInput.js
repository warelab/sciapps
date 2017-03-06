'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import {Input, Button} from 'react-bootstrap';

const AppsInput=React.createClass({
	mixins: [Reflux.listenTo(DsStore, 'handleDsStoreChange')],

	getInitialState: function() {
		return {
			setting: _config.setting,
			textValue: this.props.useResubmit ? this.props.resubmitValue : this.props.data.value.default,
			fileValue: ''
		};
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.useResubmit) {
			this.setState({textValue: nextProps.resubmitValue, fileValue: ''});
		}
	},

	componentWillUnmount: function() {
		this.setState({textValue: this.props.data.value.default});
	},

	handleDsStoreChange: function(dsStore) {
		let dsItemPath=dsStore.dsItemPaths[this.props.data.id];
		let dsItemUrl=dsItemPath ? 'agave://' + this.state.setting.datastore_system + '/example_data/' + dsItemPath : '';
		if (dsItemUrl && dsItemUrl !== this.state.textValue) {
			this.setState({
				textValue: dsItemUrl 
			});
		}
	},

	handleTextChange: function(event) {
		this.setState({textValue: event.target.value});
	},

	handleFileChange: function(event) {
		this.setState({fileValue: event.target.value});
	},

	handleDataStore: function(event) {
		DsActions.setDataStoreItemTarget(this.props.data.id);
		DsActions.showDataStore();
	},

	validateState: function() {
		if (this.props.data.value.required && ! (this.state.textValue.length || this.state.fileValue.length)) return 'warning';
		else return undefined;
	},

	buildAgaveAppsInput: function() {
		let data=this.props.data;
		let prefix=data.value.required ? '*' : '';
		let suffix=this.state.setting['upload_suffix'] || '.upload';
		let markup;
		if (! data.value.visible) {
			let props={
				key: data.id,
				name: data.id,
				value: this.state.textValue
			};
			markup=(<Input {...props} />);
		} else {
			let dataStoreButton=(
				<Button onClick={this.handleDataStore} bsStyle={this.props.onValidate ? this.validateState() : 'default'} >or Browse DataStore</Button>
			);
			let props={
				label: prefix + data.details.label,
				help: data.details.description,
				bsStyle: this.props.onValidate ? this.validateState() : undefined,
				wrapperClassName: 'wrapper'
			};
			let textProps={
				key: data.id,
				name: data.id,
				value: this.state.textValue,
				type: 'text',
        buttonBefore: dataStoreButton,
				placeholder: 'or Enter URL',
				className: 'form-control',
				onChange: this.handleTextChange
			};
			let fileProps={
				key: data.id + suffix,
				name: data.id + suffix,
				value: this.state.fileValue,
				type: 'file',
				className: 'wf-load-box',
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
		let markup=this.buildAgaveAppsInput();
		return markup;
	}
});

module.exports = AppsInput;
