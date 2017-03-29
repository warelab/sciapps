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
import {Panel, Button, ButtonToolbar} from 'react-bootstrap';

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
		let setting=_config.setting;
		let required=_.keys(this.state.required);
		let form=this.refs[this.formName];
		let formdata={};
		return utilities.validateForm(form, required, setting.upload_suffix);
	},

	handleSubmit: function(event) {
		this.setState({onSubmit: true, onValidate: true});
		let wid;
		if (this.validateForm()) {
			let formData=new FormData(this.refs[this.formName]);
			wid=formData.get('_workflow_id');
			WorkflowActions.submitWorkflow(formData);
			this.setState({onValidate: false});
		}
		setTimeout(() => {
			this.setState({onSubmit: false});
		}, 1500);
		this.showWorkflowDiagram();
	},

	showWorkflowDiagram: function() {
		WorkflowActions.showWorkflowDiagram();
	},

	render: function() {
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
			runDetail.id=wid;
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
			markup=(
				<div>
				<form ref={this.formName} >
					{appsFieldsets}
					<BaseInput data={emailInput} />
					<BaseInput data={workflowJson} />
					<BaseInput data={workflowId} />
					<ButtonToolbar>
					<Button
						bsStyle='primary'
						disabled={onSubmit}
						onClick={onSubmit ? null : this.handleSubmit}>
						{onSubmit ? 'Submitting...' : 'Submit Workflow Jobs'}
					</Button>
					<Button bsStyle='primary' onClick={this.showWorkflowDiagram}>
                                        	Show Workflow Diagram
                                	</Button>
					</ButtonToolbar>
				</form>
				</div>
			);
		}
		return markup;
	}
});

module.exports = WorkflowRunnerForm;
