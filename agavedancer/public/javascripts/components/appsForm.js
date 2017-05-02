'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import Q from 'q';
import {Panel, Button, Alert, Tooltip, OverlayTrigger} from 'react-bootstrap';
import BaseInput from './baseInput.js';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import JobsActions from '../actions/jobsActions.js';
import utilities from '../libs/utilities.js';

const AppsForm=React.createClass({
	getInitialState: function() {
		return { onSubmit: false, onValidate: false, required: {} };
	},

	formName: 'agaveWebAppForm',

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			onSubmit: false,
			onValidate: false
		});
	},

	handleSubmit: function() {
		let setting=_config.setting;
		let required=[];
		let appDetail=this.props.appDetail;
		if (appDetail && undefined !== appDetail.name) {
			if (appDetail.inputs && appDetail.inputs.length) {
				appDetail.inputs.forEach(function(input) {
					if (input.value.required) {
						required.push(input.id);
					}
				});
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				appDetail.parameters.forEach(function(param) {
					if (param.value.required) {
						required.push(param.id);
					}
				});
			}
		}
		let form=this.refs[this.formName];
		let validated=utilities.validateForm(form, required, setting.upload_suffix);

		//this.setState({onSubmit: true, onValidate: true});
		if(validated) {
			let formData=new FormData(this.refs[this.formName]);
			JobsActions.submitJob(this.props.appDetail.id, formData);
			this.setState({onValidate: false});
		}
		Q.delay(1000).then(function() {
			this.setState({onSubmit: false});
		}.bind(this));
		//setTimeout(() => {
		//	this.setState({onSubmit: false});
		//}, 1500);
	},

	handleSubmitPrepare: function() {
		this.setState({onSubmit: true, onValidate: true});
	},

	handleSubmitDismiss: function() {
		this.setState({onSubmit: false, onValidate: false});
	},

	render: function() {
		let user=this.props.user;
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
					let resubmitValue;
					if (useResubmit) {
						resubmitValue=jobDetail.inputs[input.id];
					}
					return(<AppsInput key={appDetail.id + ':' + input.id} data={input} useResubmit={useResubmit} resubmitValue={resubmitValue} onValidate={onValidate} user={this.props.user} />);
				}.bind(this));
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				let sortedParams=_.sortBy(appDetail.parameters, utilities.getValueOrder);
				app_params=sortedParams.map(function(param) {
					let resubmitValue;
					if (useResubmit) {
						resubmitValue=jobDetail.parameters[param.id];
					}
					return(<AppsParam key={appDetail.id + ':' + param.id} data={param} useResubmit={useResubmit} resubmitValue={resubmitValue} onValidate={onValidate} user={this.props.user} />);
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
		let submitBtn;
		if (user.logged_in) {
			if (this.state.onSubmit) {
				submitBtn=(
					<Alert bsStyle='warning' onDismiss={this.handleSubmitDismiss}>
						<p>You are going to submit 1 job to a cluster, are you sure?</p>
						<Button bsStyle='primary' onClick={this.handleSubmit}>Yes</Button>
						<span> or </span>
						<Button onClick={this.handleSubmitDismiss}>No</Button>
					</Alert>
				);
			} else {
				submitBtn=(
					<Button bsStyle='primary' onClick={this.handleSubmitPrepare}>Submit Job</Button>
				);
			}
		} else {
			let tooltipsubmit = <Tooltip id="tooltisubmit">Please log in to submit job</Tooltip>;
			submitBtn=(
				<OverlayTrigger placement="bottom" overlay={tooltipsubmit}>
					<Button bsStyle='primary' onClick={null}>Submit Job</Button>
				</OverlayTrigger>
			);
		}
		return (
			<Panel header={header}>
				<form ref={this.formName}>
					{app_inputs}
					{app_params}
					<BaseInput data={emailInput} />
					{submitBtn}
				</form>
			</Panel>
		);
	}
});

module.exports = AppsForm;
