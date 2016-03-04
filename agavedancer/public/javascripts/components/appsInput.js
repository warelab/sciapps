'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import DsActions from '../actions/dsActions.js';
import DsStore from '../stores/dsStore.js';
import SettingsStore from '../stores/settingsStore.js';
import {Input, Button} from 'react-bootstrap';

const AppsInput=React.createClass({
	mixins: [Reflux.listenTo(DsStore, 'handleDsStoreChange'), Reflux.connect(SettingsStore, 'settingsStore')],

	getInitialState: function() {
		return {
			textValue: this.props.data.value.default,
			fileValue: this.props.data.value.default
		};
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			fileValue: nextProps.data.value.default,
			textValue: nextProps.data.value.default
		});
	},

	handleDsStoreChange: function(dsStore) {
		let dsItemPath=_.get(dsStore.dsItemPaths, this.props.data.id);
		let dsItemUrl=dsItemPath ? 'agave://' + this.state.settingsStore.settings.datastore_system + '/' + dsItemPath : '';
		if (dsItemUrl !== this.state.textValue) {
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

	buildAgaveAppsInput: function() {
		let data=this.props.data;
		let suffix=_.get(this.state.settingsStore.settings, 'upload_suffix', '.upload');
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
				<Button onClick={this.handleDataStore}>DataStore</Button>
			);
			let props={
				label: data.details.label,
				wrapperClassName: 'wrapper'
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
		let markup=this.buildAgaveAppsInput();
		return markup;
	}
});

module.exports = AppsInput;
