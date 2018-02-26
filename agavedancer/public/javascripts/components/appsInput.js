'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import AppsActions from '../actions/appsActions.js';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import {Input, Button, Glyphicon} from 'react-bootstrap';

const AppsInput=React.createClass({
	mixins: [Reflux.listenTo(DsStore, 'handleDsStoreChange')],

	getInitialState: function() {
		let value=[], count=1, active=0;
		let reload=this.props.relad;
		if (reload === 'resubmit' || this.props.data.value.value !== undefined) {
			value=this.props.data.value.value;
			if (_.isArray(this.props.data.value.value)) {
				input=this.props.data.value.value.length;
				value=this.props.data.value.value;
			} else {
				value[0]=this.props.data.value.value;
			}
		} else {
			value[0]=this.props.data.value.default;
		}
		return {
			active: active,
			count: count,
			value: value
		};
	},

	componentWillReceiveProps: function(nextProps) {
		let reload=this.props.reload;
		let value=[], count=1;
		if (reload === 'resubmit') {
			if (_.isArray(nextProps.data.value.value)) {
				count=nextProps.data.value.value.length;
				value=nextProps.data.value.value;
			}
			this.setState({count: count, value: value});
		} else if (reload === 'default') {
			if (_.isArray(nextProps.data.value.default)) {
				count=nextProps.data.value.default.length;
				value=nextProps.data.value.default;
			} else {
				value[0]=nextProps.data.value.default;
			}
			this.setState({count: count, value: value});
		}
	},

	componentWillUnmount: function() {
		this.setState({count: 1, value: this.props.data.value.default});
	},

	handleDsStoreChange: function(dsStore) {
		let setting=_config.setting;
		let dsItemUrl;
		let dsItemPath=dsStore.dsItemPaths[this.props.data.id + '_' + this.state.active];
		if (dsItemPath) {
			let datastore=setting.datastore[dsItemPath.type];
			//dsItemUrl='https://agave.iplantc.org/jobs/v2/' + [datastore.system, 'outputs/media', datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
			//dsItemUrl=setting.public_datastore_type === '__exampleData__' ? 'agave://' + [datastore.system, datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/') : 'https://agave.iplantc.org/jobs/v2/' + [datastore.system, 'outputs/media', datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
			dsItemUrl='agave://' + [datastore.system, datastore.path, (dsItemPath.path ? dsItemPath.path + '/' : '') + dsItemPath.name].join('/');
		} else if (dsItemPath === '') {
			dsItemUrl='';
		}
		//if (dsItemUrl && dsItemUrl !== this.state.value) {
		if (dsItemUrl !== undefined && dsItemUrl !== this.state.value) {
			let value=this.state.value;
			value[this.state.active]=dsItemUrl;
			this.setState({
				value: value
			});
		}
	},

	handleTextChange: function(event) {
		let match=event.target.id.match(/_(\d+)$/);
		let value=this.state.value;
		if (match !== null) {
			value[match[1]]=event.target.value;
			this.setState({value: value});
		}
	},

	handleDataStore: function(event) {
		let match=event.target.id.match(/^btn_(.*_(\d+))$/);
		if (match !== null) {
			DsActions.setDataStoreItemTarget(match[1]);
			DsActions.showDataStore();
			this.setState({active: match[2]});
		}
	},

	handleAddInput: function(event) {
		this.setState({count: this.state.count + 1});
	},

	validateState: function() {
		if (this.props.data.value.required && ! this.state.value.length) return 'warning';
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
				value: this.state.value
			};
			markup=(<Input {...props} />);
		} else {
			let props={
				label: prefix + data.details.label,
				help: data.details.description,
				bsStyle: this.props.onValidate ? this.validateState() : undefined,
				wrapperClassName: 'wrapper'
			};
			let textProps={
				name: data.id,
				type: 'text',
				placeholder: 'or Enter a URL',
				className: 'form-control',
				onChange: this.handleTextChange
			};
			let inputs=[];
			for (let i=0; i < this.state.count; i++) {
				textProps.id=data.id + '_' + i;
				textProps.key=data.id + '_' + i;
				textProps.value=this.state.value[i];
				textProps.buttonBefore=<Button id={'btn_' + data.id + '_' + i} onClick={this.handleDataStore} bsStyle={this.props.onValidate ? this.validateState() : 'default'} >Browse DataStore</Button>;
				inputs[i]=<Input {...textProps} />;
			}

			markup=(
				<div>
					<Input {...props}>{inputs}</Input>
					<Button onClick={this.handleAddInput}><Glyphicon glyph='plus' /></Button>
				</div>
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
