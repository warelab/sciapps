'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsFieldset from './appsFieldset.js';
import BaseInput from './baseInput.js';
import AppsStore from '../stores/appsStore.js';
import WorkflowStore from '../stores/workflowStore.js';
import AppsActions from '../actions/appsActions.js';
import JobsActions from '../actions/jobsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import _ from 'lodash';
import utilities from '../libs/utilities.js';
import {Panel, Button, ButtonToolbar, Alert, Tooltip, OverlayTrigger} from 'react-bootstrap';

const WorkflowRunnerForm=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			onSubmit: false,
			onValidate: false,
			required: {}
		}
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			onSubmit: false,
			onValidate: false
		});
	},

	componentWillUnmount: function() {
		WorkflowActions.hideWorkflow();
		AppsActions.resetWorkflowApps();
	},

	formName: 'workflowRunnerForm',

	validateForm: function() {
		let user=this.props.user;
		let setting=_config.setting;
		let required=_.keys(this.state.required);
		let form=this.refs[this.formName];
		return utilities.validateForm(form, required, setting.upload_suffix);
	},

	handleSubmit: function(event) {
		//this.setState({onSubmit: true, onValidate: true});
		let wid;
		if (this.validateForm()) {
			let formData=new FormData(this.refs[this.formName]);
			wid=formData.get('_workflow_id');
			WorkflowActions.submitWorkflow(formData);
			this.setState({onSubmit: false, onValidate: false});
		}
		//setTimeout(() => {
		//	this.setState({onSubmit: false});
		//}, 1500);
		this.showWorkflowDiagram();
	},

	handleSubmitPrepare: function() {
		this.setState({onSubmit: true, onValidate: true});
	},

	handleSubmitDismiss: function() {
		this.setState({onSubmit: false, onValidate: false});
	},

	showWorkflowDiagram: function() {
		WorkflowActions.showWorkflowDiagram();
	},

	render: function() {
		let user=this.props.user;
		let wid=utilities.uuid();
		let workflowStore=this.state.workflowStore;
		let appsStore=this.state.appsStore;
		let setting=_config.setting;
		let markup=<div />, appsFieldsets;
		let onSubmit=this.state.onSubmit, onValidate=this.state.onValidate;
		let required=this.state.required={};
		if (workflowStore.workflowDetail && appsStore.wid[workflowStore.workflowDetail.id]) {
			let workflowDetail=workflowStore.workflowDetail;
			let steps=workflowDetail.steps;
			appsFieldsets=steps.map(function(step, i) {
				let showAppId=step.appId.replace(/\-[\.\d]+$/, '');
				let appId=step.appId;
				let appDetail=_.cloneDeep(appsStore.appDetailCache[appId]);
				_.forEach(appDetail.inputs, function(v) {
					let ic=step.inputs[v.id];
					if (_.isPlainObject(ic)) {
						v.value.default=(setting.wf_step_prefix + ic.step + ':' + ic.output_name).toLowerCase();
					} else if (ic) {
						v.value.default=ic;
					}
					v.id=setting.wf_step_prefix + i + ':' + v.id;
					if (v.value.required) {
						required[v.id]=1;
					}
				});
				_.forEach(appDetail.parameters, function(v) {
					let p=step.parameters[v.id];
					if (p !== undefined) {
						v.value.default=p;
					}
					v.id=setting.wf_step_prefix + i + ':' + v.id;
					if (v.value.required) {
						required[v.id]=1;
					}
				});
				return <AppsFieldset key={i} appDetail={appDetail} index={i} onValidate={onValidate} />;
			});
			let emailInput={
				type: 'email',
				id: '_email',
				name: '_email',
				label: 'Email Address',
				placeholder: 'Enter email',
				help: 'Optional Email for notification'
			};
			let runDetail=_.cloneDeep(workflowDetail);
			_.assign(runDetail, {
				id: wid,
				name: 'workflow-' + wid + '-' + workflowDetail.name,
				description: workflowDetail.description || ''
			});

			runDetail.steps.forEach(function(step) {
				step.jobId=undefined;
			});
			let workflowJson={
				type: 'hidden',
				id: '_workflow_json',
				name: '_workflow_json',
				value: JSON.stringify(runDetail)
			};
			let workflowId={
				type: 'hidden',
				id: '_workflow_id',
				name: '_workflow_id',
				value: wid
			};
			let submitBtn;
			if (user.logged_in) {
				if (this.state.onSubmit) {
					submitBtn=(
						<Alert bsStyle='warning' onDismiss={this.handleSubmitDismiss}>
							<p>You are going to submit {steps.length} jobs to a cluster, are you sure?</p>
							<Button bsStyle='primary' onClick={this.handleSubmit}>Yes</Button>
							<span> or </span>
							<Button onClick={this.handleSubmitDismiss}>No</Button>
						</Alert>
					);
				} else {
					submitBtn=(
						<Button bsStyle='primary' onClick={this.handleSubmitPrepare}>Submit Jobs</Button>
					);
				}
			} else {
				let tooltipsubmit = <Tooltip id="tooltisubmit">Please log in to submit job</Tooltip>;
				submitBtn=(
					<OverlayTrigger placement="bottom" overlay={tooltipsubmit}>
						<Button bsStyle='primary' onClick={null}>Submit Jobs</Button>
					</OverlayTrigger>
				);
			}
			markup=(
				<div>
				<form ref={this.formName} >
					{appsFieldsets}
					<BaseInput data={emailInput} />
					<BaseInput data={workflowJson} />
					<BaseInput data={workflowId} />
					{submitBtn}
					<span> or </span>
					<Button bsStyle='primary' onClick={this.showWorkflowDiagram}>Show Diagram</Button>
				</form>
				</div>
			);
		}
		return markup;
	}
});

module.exports = WorkflowRunnerForm;
