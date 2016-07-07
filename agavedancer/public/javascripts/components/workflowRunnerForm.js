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
import {Panel, Button} from 'react-bootstrap';
import Mermaid from './mermaid.js';

const WorkflowRunnerForm=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			onSubmit: false,
			onValidate: false,
			setting: _config.setting,
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
	},

	formName: 'workflowRunnerForm',

	validateForm: function() {
		let setting=this.state.setting;
		let required=_.keys(this.state.required);
		let form=this.refs[this.formName];
		let formdata={};
		return utilities.validateForm(form, required, setting.upload_suffix);
	},

	handleSubmit: function() {
		this.setState({onSubmit: true, onValidate: true});
		if (this.validateForm()) {
			let formData=new FormData(this.refs[this.formName]);
			WorkflowActions.submitWorkflow(formData);
			this.setState({onValidate: false});
		}
		setTimeout(() => {
			this.setState({onSubmit: false});
		}, 1500);
	},

	showWorkflowDiagram: function(event) {
		WorkflowActions.showWorkflowDiagram(event.target.value);
	},

	render: function() {
		let workflowStore=this.state.workflowStore;
		let appsStore=this.state.appsStore;
		let setting=this.state.setting;
		let markup=<div />, appsFieldsets;
		let onSubmit=this.state.onSubmit, onValidate=this.state.onValidate;
		let required=this.state.required={};
		if (workflowStore.workflowDetail && appsStore.wid[workflowStore.workflowDetail.id]) {
			let steps=workflowStore.workflowDetail.steps;
			let diagramDefStmts=['graph LR']; 
			appsFieldsets=steps.map(function(step, i) {
				let showAppId=step.appId.replace(/\-[\.\d]+$/, '');
				diagramDefStmts.push(step.id + '[' + showAppId + ']');
				diagramDefStmts.push("class " + step.id + " appsNode");
				let appId=step.appId;
				let appDetail=_.cloneDeep(appsStore.appDetailCache[appId]);
				//_.forEach(appDetail.outputs, function(v) {
				//	let output_name=(setting.wf_step_prefix + step.id + ':' + v.value.default).toLowerCase();
				//	diagramDefStmts.push(output_name + '(' + v.value.default + ')');
				//	diagramDefStmts.push("class " + output_name + " fileNode");
				//	diagramDefStmts.push(step.id + '-->' + output_name);
				//});
				_.forEach(appDetail.inputs, function(v) {
					let ic=step.inputs[v.id];
					if (ic) {
						//v.value.default=(setting.wf_step_prefix + ic.step + ':' + ic.output_name).toLowerCase();
						//diagramDefStmts.push(v.value.default + '(' + ic.output_name + ')');
						//diagramDefStmts.push("class " + v.value.default + " fileNode");
						//diagramDefStmts.push(ic.step + '-->' + v.value.default);
						//diagramDefStmts.push(v.value.default + '-->' + step.id);
						diagramDefStmts.push( ic.step + '-->|' + ic.output_name + '|' + step.id)
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
			let workflowJson={
				type: 'hidden',
				id: '_workflow_json',
				name: '_workflow_json',
				value: JSON.stringify(workflowStore.workflowDetail)
			};
			let diagramDef=_.uniq(diagramDefStmts).join(';\n');
			markup=(
				<div>
				<Button bsStyle='primary' value={diagramDef} onClick={this.showWorkflowDiagram}>
					Show Diagram
				</Button>
				<form ref={this.formName} >
					{appsFieldsets}
					<BaseInput data={emailInput} />
					<BaseInput data={workflowJson} />
					<Button
						bsStyle='primary'
						disabled={onSubmit}
						onClick={onSubmit ? null : this.handleSubmit}>
						{onSubmit ? 'Submitting...' : 'Submit Workflow'}
					</Button>
				</form>
				</div>
			);
		}
		return markup;
	}
});

module.exports = WorkflowRunnerForm;
