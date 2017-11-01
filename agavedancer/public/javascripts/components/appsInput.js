'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import AppsActions from '../actions/appsActions.js';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import {Input, Button} from 'react-bootstrap';

const AppsInput=React.createClass({
	mixins: [Reflux.listenTo(DsStore, 'handleDsStoreChange')],

	getInitialState: function() {
		let textValue;
		let reload=this.props.relad;
		if (reload === 'resubmit' || this.props.data.value.value !== undefined) {
			textValue=this.props.data.value.value;
		} else {
			textValue=this.props.data.value.default;
		}
		return {
			textValue: textValue
		};
	},

	componentWillReceiveProps: function(nextProps) {
		let reload=this.props.reload;
		if (reload === 'resubmit') {
			this.setState({textValue: nextProps.data.value.value});
		} else if (reload === 'default') {
			this.setState({textValue: nextProps.data.value.default});
		}
	},

	componentWillUnmount: function() {
		this.setState({textValue: this.props.data.value.default});
	},

	handleDsStoreChange: function(dsStore) {
		let setting=_config.setting;
		let dsItemUrl;
		let dsItemPath=dsStore.dsItemPaths[this.props.data.id];
		if (dsItemPath) {
			let datastore=setting.datastore[dsItemPath.type];
			//dsItemUrl='https://agave.iplantc.org/jobs/v2/' + [datastore.system, 'outputs/media', datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
			//dsItemUrl=setting.public_datastore_type === '__exampleData__' ? 'agave://' + [datastore.system, datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/') : 'https://agave.iplantc.org/jobs/v2/' + [datastore.system, 'outputs/media', datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
			dsItemUrl='agave://' + [datastore.system, datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
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
				<Button onClick={this.handleDataStore} bsStyle={this.props.onValidate ? this.validateState() : 'default'} >Browse DataStore</Button>
			);
			let props={
				label: prefix + data.details.label,
				help: data.details.description,
				bsStyle: this.props.onValidate ? this.validateState() : undefined,
				key: data.id,
				name: data.id,
				value: this.state.textValue,
				type: 'text',
        buttonBefore: dataStoreButton,
				placeholder: 'or Enter a URL',
				//className: 'form-control',
				onChange: this.handleTextChange
			};
			markup=(
				<Input {...props} />
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
