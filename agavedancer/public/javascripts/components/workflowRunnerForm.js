'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsFieldset from './appsFieldset.js';
import BaseInput from './baseInput.js';
import AppsStore from '../stores/appsStore.js';
import WorkflowStore from '../stores/workflowStore.js';
import AppsActions from '../actions/appsActions.js';
import WorkflowActions from '../actions/workflowActions.js';
import _ from 'lodash';
import utilities from '../libs/utilities.js';
import {Panel, Button} from 'react-bootstrap';

const WorkflowRunnerForm=React.createClass({
	mixins: [Reflux.connect(AppsStore, 'appsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			setting: _config.setting,
			onSubmit: false,
			onValidate: false
		}
	},

	formName: 'workflowRunnerForm',

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			onSubmit: false,
			onValidate: false
		});
	},

	handleSubmit: function() {
		this.validateForm();
		1;
	},

	validateForm: function() {
		let setting=this.state.setting;
		let required=[];
		let form=this.refs[this.formName];
		let formdata={};
		return utilities.validateForm(form, required, setting.upload_suffix);
	},
	
	render: function() {
		let workflowStore=this.state.workflowStore;
		let appsStore=this.state.appsStore;
		let setting=this.state.setting;
		let markup=<div />, appsFieldsets;
		let onSubmit=this.state.onSubmit, onValidate=this.state.onValidate;
		if (workflowStore.workflowDetail && appsStore.wid[workflowStore.workflowDetail.id]) {
			let steps=workflowStore.workflowDetail.steps;
			let steps_keys=_.keys(steps).sort();
			for (let step_key in steps_keys) {
			}
			appsFieldsets=steps_keys.map(function(o) {
				let appId=steps[o].appId;
				let appDetail=_.cloneDeep(appsStore.appDetailCache[appId]);
				_.forEach(appDetail.inputs, function(v) {
					let ic=steps[o].input_connections[v.id];
					if (ic) {
						v.value.default=setting.wf_step_prefix + ic.step + ':' + ic.output_name;
					}
					v.id=setting.wf_step_prefix + o + ':' + v.id;
				});
				_.forEach(appDetail.parameters, function(v) {
					let p=steps[o].parameters[v.id];
					if (p !== undefined) {
						v.value.default=p;
					}
					v.id=setting.wf_step_prefix + o + ':' + v.id;
				});
				return <AppsFieldset key={o} appDetail={appDetail} index={o} />;
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
			markup=(
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
			);
		}
		return markup;
	}
});

module.exports = WorkflowRunnerForm;
