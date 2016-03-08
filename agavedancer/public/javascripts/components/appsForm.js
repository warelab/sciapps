'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Button} from 'react-bootstrap';
import BaseInput from './baseInput.js';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import JobsActions from '../actions/jobsActions.js';

function sortBy(unsorted) {
	return _.sortBy(unsorted, function(item) {
		return item.value.order;
	});
}

const AppsForm=React.createClass({
	getInitialState() {
		let appDetail=this.props.appDetail;
		let required={};
		let setRequired=function (item) {
			if (item.value.required) required[item.id]=1
		};
		if (appDetail.inputs && appDetail.inputs.length) {
			appDetail.inputs.forEach(setRequired);
		}
		if (appDetail.parameters && appDetail.parameters.length) {
			appDetail.parameters.forEach(setRequired);
		}
		return { onSubmit: false, onValidate: false, required: required};
	},

	validateForm: function() {
		let appDetail=this.props.appDetail;
		let required=this.state.required;
		let form=this.refs.agaveWebAppForm;
		for (let key of _.keys(form)) {
			let res = _.has(required, form[key].name) && ! _.toString(form[key].value).length;
			if (res) return false;
		}
		return true;
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			onSubmit: false,
			onValidate: false
		});
	},

	handleSubmit: function() {
		this.setState({onSubmit: true, onValidate: true});
		if(this.validateForm()) {
			let formData=new FormData(this.refs.agaveWebAppForm);
			//JobsActions.submitJob(this.props.appDetail.id, formData);
		}
		setTimeout(() => {
			this.setState({onSubmit: false});
		}, 1000);
	},

	render: function() {
		let appDetail=this.props.appDetail;
		let onSubmit=this.state.onSubmit, onValidate=this.state.onValidate;
		let getValueOrder=function(item) { return item.value.order };
		let app_inputs=[], app_params=[], header=appDetail.name + ' (SciApps Version ' + appDetail.version + '): ' + appDetail.shortDescription;

		if (appDetail && undefined !== appDetail.name) {
			if (appDetail.inputs && appDetail.inputs.length) {
				let sortedInputs=_.sortBy(appDetail.inputs, getValueOrder);
				app_inputs=sortedInputs.map(function(input) {
					return(<AppsInput key={input.id} data={input} onValidate={onValidate} />);
				});
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				let sortedParams=_.sortBy(appDetail.parameters, getValueOrder);
				app_params=sortedParams.map(function(param) {
					return(<AppsParam key={param.id} data={param} onValidate={onValidate} />);
				});
			}
		}
		let emailInput={
			type: 'email',
			id: '_email',
			name: '_email',
			label: 'Email Address',
			placeholder: 'Enter email',
			help: 'Optional Email for notification'
		};
		return (
			<Panel header={header}>
				<form ref='agaveWebAppForm'>
					<fieldset>
						{app_inputs}
					</fieldset>
					<fieldset>
						{app_params}
					</fieldset>
					<fieldset>
						<BaseInput data={emailInput} />
					</fieldset>
					<Button
						bsStyle='primary'
						disabled={onSubmit}
						onClick={onSubmit ? null : this.handleSubmit}>
						{onSubmit ? 'Submitting...' : 'Submit Job'}
					</Button>
				</form>
			</Panel>
		);
	}
});

module.exports = AppsForm;
