'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import {Panel, Button} from 'react-bootstrap';
import BaseInput from './baseInput.js';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import JobsActions from '../actions/jobsActions.js';
import utilities from '../libs/utilities.js';

const AppsForm=React.createClass({
	getInitialState: function() {
		return { onSubmit: false, onValidate: false, setting: _config.setting, required: {} };
	},

	formName: 'agaveWebAppForm',

	validateForm: function() {
		let setting=this.state.setting;
		let required=_.keys(this.state.required);
		let form=this.refs[this.formName];
		let formdata={};
		return utilities.validateForm(form, required, setting.upload_suffix);
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
			let formData=new FormData(this.refs[this.formName]);
			JobsActions.submitJob(this.props.appDetail.id, formData);
			this.setState({onValidate: false});
		}
		setTimeout(() => {
			this.setState({onSubmit: false});
		}, 1500);
	},

	render: function() {
		let appDetail=this.props.appDetail;
		let jobDetail=this.props.jobDetail;
		let resubmit=this.props.resubmit;
		let onSubmit=this.state.onSubmit, onValidate=this.state.onValidate;
		let useResubmit=resubmit && appDetail.id === jobDetail.appId; 
		let app_inputs=[], app_params=[], header=appDetail.name + ' (SciApps Version ' + appDetail.version + '): ' + appDetail.shortDescription;

		if (appDetail && undefined !== appDetail.name) {
			if (appDetail.inputs && appDetail.inputs.length) {
				let sortedInputs=_.sortBy(appDetail.inputs, utilities.getValueOrder);
				app_inputs=sortedInputs.map(function(input) {
					if (input.value.required) {
						this.state.required[input.id]=1;
					}
					let resubmitValue;
					if (useResubmit) {
						resubmitValue=jobDetail.inputs[input.id];
					}
					return(<AppsInput key={input.id} data={input} useResubmit={useResubmit} resubmitValue={resubmitValue} onValidate={onValidate} />);
				}.bind(this));
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				let sortedParams=_.sortBy(appDetail.parameters, utilities.getValueOrder);
				app_params=sortedParams.map(function(param) {
					if (param.value.required) {
						this.state.required[param.id]=1;
					}
					let resubmitValue;
					if (useResubmit) {
						resubmitValue=jobDetail.parameters[param.id];
					}
					return(<AppsParam key={param.id} data={param} useResubmit={useResubmit} resubmitValue={resubmitValue} onValidate={onValidate} />);
				}.bind(this));
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
				<form ref={this.formName}>
					{app_inputs}
					{app_params}
					<BaseInput data={emailInput} />
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
