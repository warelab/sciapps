'use strict';

import React from 'react';
import Reflux from 'reflux';
import _ from 'lodash';
import Q from 'q';
import {Panel, Button, Alert, Tooltip, OverlayTrigger} from 'react-bootstrap';
import BaseInput from './baseInput.js';
import AppsParam from './appsParam.js';
import AppsInput from './appsInput.js';
import AppsActions from '../actions/appsActions.js';
import JobsActions from '../actions/jobsActions.js';
import dsActions from '../actions/dsActions.js';
import utilities from '../libs/utilities.js';
import Dialog from 'react-bootstrap-dialog';

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

	componentWillUnmount () {
		this.formData=undefined;
		Dialog.resetOptions();
	},

	handleSubmit: function() {
		dsActions.clearDataStoreItem();
		this.setState({onSubmit: true, onValidate: true});
		let setting=_config.setting;
		let required=[];
		let appDetail=this.props.appDetail;
		let user=this.props.user;
		if (appDetail && undefined !== appDetail.name) {
			if (appDetail.inputs && appDetail.inputs.length) {
				appDetail.inputs.forEach(function(input) {
					if (input.value.required) {
						required.push(input.id);
					}
					//if (input.value.default !== undefined) {
					//	data[input.id]=_.isArray(input.value.default) ? input.value.default : [input.value.default]; 
					//}
				});
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				appDetail.parameters.forEach(function(param) {
					if (param.value.required) {
						required.push(param.id);
					}
					//if (param.value.default !== undefined) {
					//	data[param.id]=param.value.default;
					//}
				});
			}
		}
		let form=this.refs[this.formName];
		let validated=utilities.validateForm(form, required, setting.upload_suffix);
		let confirmed;
		if (user.logged_in) {
			if (validated) {
				let formData=new FormData(this.refs[this.formName]);
				this.refs.dialog.show({
					body: 'Are you sure you want to submit this job?',
					actions: [
						Dialog.CancelAction(),
						Dialog.Action(
							'Submit',
							() => {
								JobsActions.submitJob(this.props.appDetail.id, formData);
								this.setState({onValidate: false});
								Q.delay(1000).then(function() {
									this.refs.dialog.showAlert('Submitted! Check History panel for status');
								}.bind(this));
							},
							'btn-warning'
						)
					]
				});
			} else {
				//alert('There is something missing in your job submission form.');
				this.refs.dialog.showAlert('There is something missing in your job submission form.');
			}
		} else {
			this.refs.dialog.showAlert('Please login to submit your analysis job!');
		}
			//if (confirmed) {
			//	JobsActions.submitJob(this.props.appDetail.id, formData);
			//	this.setState({onValidate: false});
			//}

		Q.delay(1000).then(function() {	
			//if (confirmed) {
			//	alert('Job has been submitted.');
			//}
			this.setState({onSubmit: false});
		}.bind(this));
		//this.setState({onSubmit: true, onValidate: true});
		//if(validated) {
		//	let formData=new FormData(this.refs[this.formName]);
		//	JobsActions.submitJob(this.props.appDetail.id, formData);
		//	this.setState({onValidate: false});
		//}
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
		let appDetail=_.cloneDeep(this.props.appDetail);
		let onSubmit=this.state.onSubmit, onValidate=this.state.onValidate;
		let app_inputs=[], app_params=[], header=appDetail.name + ' (SciApps Version ' + appDetail.version + '): ' + appDetail.shortDescription;
		let reload=this.props.reload;

		if (appDetail && undefined !== appDetail.name) {
			let jobDetail=appDetail._jobDetail;
			if (appDetail.inputs && appDetail.inputs.length) {
				let sortedInputs=_.sortBy(appDetail.inputs, utilities.getValueOrder);
				app_inputs=sortedInputs.map(function(input) {
					if (jobDetail && jobDetail.inputs[input.id] !== undefined) {
						//input.value.value=JSON.stringify(jobDetail.inputs[input.id]);
						input.value.value=jobDetail.inputs[input.id];
						//input.value.value=jobDetail.inputs[input.id][0];
					}
					let appsInput=<AppsInput key={appDetail.id + ':' + input.id} data={input} reload={reload} onValidate={onValidate} user={this.props.user} />;
					return appsInput;
				}.bind(this));
			}
			if (appDetail.parameters &&  appDetail.parameters.length) {
				let sortedParams=_.sortBy(appDetail.parameters, utilities.getValueOrder);
				app_params=sortedParams.map(function(param) {
					if (jobDetail && jobDetail.parameters[param.id] !== undefined) {
						param.value.value=jobDetail.parameters[param.id];
					}
					return(<AppsParam key={appDetail.id + ':' + param.id} data={param} reload={reload} onValidate={onValidate} user={this.props.user} />);
				}.bind(this));
			}
		}
		let emailInput={
			type: 'email',
			required: false,
			key: '_email',
			id: '_email',
			name: '_email',
			label: 'Email',
			help: 'Optional Email notification upon job completion'
		};
		let submitBtn=<Button bsStyle='primary' onClick={this.handleSubmit}>Submit Job</Button>; 
		//if (user.logged_in) {
		//	if (this.state.onSubmit) {
		//		submitBtn=(
		//			<Alert bsStyle='warning' onDismiss={this.handleSubmitDismiss}>
		//				<p>You are going to submit 1 job to a cluster, are you sure?</p>
		//				<Button bsStyle='primary' onClick={this.handleSubmit}>Yes</Button>
		//				<span> or </span>
		//				<Button onClick={this.handleSubmitDismiss}>No</Button>
		//			</Alert>
		//		);
		//	} else {
		//		submitBtn=(
		//			<Button bsStyle='primary' onClick={this.handleSubmitPrepare}>Submit Job</Button>
		//		);
		//	}
		//} else {
		//	let tooltipsubmit = <Tooltip id="tooltisubmit">Please log in to submit job</Tooltip>;
		//	submitBtn=(
		//		<OverlayTrigger placement="bottom" overlay={tooltipsubmit}>
		//			<Button bsStyle='primary' onClick={null}>Submit Job</Button>
		//		</OverlayTrigger>
		//	);
		//}
		return (
			<Panel header={header}>
				<form ref={this.formName}>
					{app_inputs}
					{app_params}
					<BaseInput data={emailInput} />
					{submitBtn}
				</form>
				<Dialog ref='dialog' />
			</Panel>
		);
	}
});

module.exports = AppsForm;
