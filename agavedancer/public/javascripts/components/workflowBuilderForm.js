'use strict';

import React from 'react';
import Reflux from 'reflux';
import JobsStore from '../stores/jobsStore.js';
import JobsActions from '../actions/jobsActions.js';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import BaseInput from './baseInput.js';
import _ from 'lodash';
import {Button, ButtonToolbar, Input} from 'react-bootstrap';
import utilities from '../libs/utilities.js';

const WorkflowBuilderForm=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			wid: undefined,
			setting: _config.setting,
			onSubmit: false,
			onValidate: false,
			formData: {}
		}
	},

	componentDidUpdate: function(prevProps, prevState) {
		let workflowStore=this.state.workflowStore;
		let wf=this.state.wid ? workflowStore.build[this.state.wid] : undefined;
		if (this.state.onSubmit && wf && wf.completed) {
			WorkflowActions.showWorkflow(wf.id);
			WorkflowActions.showWorkflowDiagram();
			this.setState({ onSubmit: false });
		}
	},

	formName: 'workflowBuilderForm',

	handleSubmit: function() {
		let wid=utilities.uuid();
		let form=this.refs[this.formName], formData={}, changed=false;;
		['jobList', 'workflowName', 'workflowDesc'].forEach(function(n) {
			if (form[n].value !== this.state.formData[n]) {
				changed=true;
			}
			formData[n]=form[n].value;
		}.bind(this));

		if (changed) {
			this.setState({onSubmit: true, wid: wid});
			WorkflowActions.buildWorkflow(wid, formData['workflowName'], formData['workflowDesc']);
			this.setState({ formData: formData });
		} else {
			WorkflowActions.showWorkflowDiagram();
		}
	},

	handleReset: function() {
		JobsActions.removeWorkflowBuilderJobIndex();
		this.setState({wid: undefined});
	},

	handleDiagram: function() {
		WorkflowActions.showWorkflowDiagram();
	},

	render: function() {
		let jobsStore=this.state.jobsStore;
		let onSubmit=this.state.onSubmit;
		let workflowBuilderJobs=jobsStore.workflowBuilderJobIndex
		.map(function(v, i) { 
			return v ? jobsStore.jobs[i] : undefined; 
		});
		let jobList='';
		let jobCount=0;
		workflowBuilderJobs.forEach(function(job, i) {
			if (job !== undefined) {
			 jobList+=(i+1) + ': ' + job.appId + "\n";
			 jobCount++;
			}
		});
		if (jobList === undefined) {
			jobList='None';
		}
		let jobListInput={
			name: 'jobList',
			label: '*Selected Jobs (at least 2)',
			type: 'textarea',
			required: true,
			readOnly: true,
			rows: 6,
			value: jobList
		};
		let nameInput={
			name: 'workflowName',
			label: '*Workflow Name',
			required: true,
			value: 'my_workflow',
			type: 'text'
		};
		let descInput={
			name: 'workflowDesc',
			label: 'Workflow Description',
			required: false,
			value: '',
			type: 'textarea',
			rows: 3
		};

		let markup=(
			<form ref={this.formName} >
				<BaseInput ref={'jobListInput'} data={jobListInput} onValidate={true} />
				<BaseInput ref={'nameInput'} data={nameInput} onValidate={true} />
				<BaseInput ref={'descInput'} data={descInput} />
				<ButtonToolbar>
					<Button
						bsStyle='primary'
						disabled={onSubmit || jobCount <2}
						onClick={this.handleSubmit}>
						{onSubmit ? 'Building...' : 'Build Workflow'}
					</Button>
					<Button
						bsStyle='primary'
						disabled={onSubmit || jobList.length === 0}
						onClick={this.handleReset}>
						Reset
					</Button>
				</ButtonToolbar>
			</form>
		);
		return markup;
	}
});

module.exports = WorkflowBuilderForm;
