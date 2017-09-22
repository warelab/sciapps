'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import {Input, Button} from 'react-bootstrap';
import Dialog from 'react-bootstrap-dialog';

const AppsInput=React.createClass({
	mixins: [Reflux.listenTo(DsStore, 'handleDsStoreChange')],

	fileSizeLimit: 10000000,

	getInitialState: function() {
		return {
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
		Dialog.resetOptions();
		this.setState({textValue: this.props.data.value.default});
	},

	handleDsStoreChange: function(dsStore) {
		let setting=_config.setting;
		let dsItemUrl;
		let dsItemPath=dsStore.dsItemPaths[this.props.data.id];
		if (dsItemPath) {
			let datastore=setting.datastore[dsItemPath.type === '__public__' ? setting.public_datastore_type : dsItemPath.type];
			//dsItemUrl='https://agave.iplantc.org/jobs/v2/' + [datastore.system, 'outputs/media', datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
			dsItemUrl=setting.public_datastore_type === '__public__' ? 'agave://' + [datastore.system, datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/') : 'https://agave.iplantc.org/jobs/v2/' + [datastore.system, 'outputs/media', datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
		} else if (dsItemPath === '') {
			dsItemUrl='';
		}
		//if (dsItemUrl && dsItemUrl !== this.state.textValue) {
		if (dsItemUrl !== undefined && dsItemUrl !== this.state.textValue) {
			this.setState({
				textValue: dsItemUrl
			});
		}
	},

	handleTextChange: function(event) {
		this.setState({textValue: event.target.value});
	},

	handleFileChange: function(event) {
		let file = event.target.files[0];
		if (file && file.size > this.fileSizeLimit) {
				this.refs.dialog.showAlert('The file size is over the limit (10 Mb).');
		} else {
			this.setState({fileValue: event.target.value});
		}
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
		let setting=_config.setting;
		let data=this.props.data;
		let prefix=data.value.required ? '*' : '';
		let suffix=setting['upload_suffix'] || '.upload';
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
					<Dialog ref='dialog' />
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
