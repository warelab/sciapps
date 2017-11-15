'use strict';

import React from 'react';
import Reflux from 'reflux';
import AppsStore from '../stores/appsStore.js';
import JobsStore from '../stores/jobsStore.js';
import JobsActions from '../actions/jobsActions.js';
import WorkflowStore from '../stores/workflowStore.js';
import WorkflowActions from '../actions/workflowActions.js';
import BaseInput from './baseInput.js';
import _ from 'lodash';
import {Button, ButtonToolbar, Input} from 'react-bootstrap';
import utilities from '../libs/utilities.js';
import Dialog from 'react-bootstrap-dialog';

const WorkflowBuilderForm=React.createClass({
	mixins: [Reflux.connect(JobsStore, 'jobsStore'), Reflux.connect(AppsStore, 'appsStore'), Reflux.connect(WorkflowStore, 'workflowStore')],

	getInitialState: function() {
		return {
			wfid: undefined,
			onSubmit: false,
			onValidate: false,
			required: ['jobList', 'workflowName'],
			formData: {}
		}
	},

	componentDidUpdate: function(prevProps, prevState) {
		let workflowStore=this.state.workflowStore;
		//let wf=this.state.wfid ? workflowStore.build[this.state.wfid] : undefined;
		let wf=this.state.wfid ? workflowStore.workflowDetailCache[this.state.wfid] : undefined;
		if (this.state.onSubmit && wf) {
			//WorkflowActions.showWorkflow(wf.id);
			WorkflowActions.showWorkflowDiagram();
			this.setState({ onSubmit: false });
		}
	},

	componentWillUnmount: function() {
		this.setState({formData: {}});
	},

	formName: 'workflowBuilderForm',

	handleSubmit: function() {
		let form=this.refs[this.formName], formData={}, changed=false;;
		let required=this.state.required;
		['jobList', 'workflowName', 'workflowDesc'].forEach(function(n) {
			if (form[n].value !== this.state.formData[n]) {
				changed=true;
			}
			formData[n]=form[n].value;
		}.bind(this));
		let validated=utilities.validateForm(form, required);
		if (changed) {
			if (validated) {
				let workflows=this.state.workflowStore.workflows;
				if (_.find(workflows, 'name', formData['workflowName'])) {
					//alert('Please choose a unique name.');
					this.refs.dialog.showAlert('A workflow with that name already exists. Please enter a different name');
				} else {
					let wfid=utilities.uuid();
					this.setState({onSubmit: true, wfid: wfid});
					let workflow=this.buildWorkflow(wfid, formData['workflowName'], formData['workflowDesc'], this.state.jobsStore, this.state.appsStore);
					WorkflowActions.setWorkflow(wfid, workflow);
				}
			} 
			this.setState({ formData: formData });
		} else {
			if (validated) {
				WorkflowActions.showWorkflowDiagram();
			}
		}
	},

	buildWorkflow: function(wfid, wfName, wfDesc, jobsStore, appsStore) {
		let setting=_config.setting;
		let workflow={
				id: wfid, 
				name: wfName,
				description: wfDesc || '',
				steps: []
		};
		let jobs=jobsStore.workflowBuilderJobIndex.map(function(v, i) {
			return v ? jobsStore.jobDetailCache[jobsStore.jobs[i].job_id] : undefined;
		}).filter(function(v) {return v !== undefined}).sort(function(a,b){return a.submitTime.localeCompare(b.submitTime)});
		let outputs={};
		jobs.forEach(function(job, index) {
			let step=this._buildWfStep(job, index, outputs);
			workflow.steps.push(step);
			let app=appsStore.appDetailCache[job.appId];
			app.outputs.forEach(function(output) {
				let filePath=job.archivePath ? job.archivePath : job.id + '/outputs/media';
				//let path=job.archivePath + '/' + output.value.default;
				//let archivePath=job.outputPath.replace(job.owner, setting.archive_path);
				let path=filePath + '/' + output.value.default;
				outputs[path]={step: index, output_name: output.value.default};
			});
		}.bind(this));
		return workflow;
	},

	_buildWfStep: function(job, index, outputs) {
		let step={
			id: index,
			appId: job.appId,
			jobId: job.id,
			inputs: {},
			parameters: job.parameters
		};
		_.forIn(job.inputs, function(iv, ik) {
			let output=_.find(outputs, function(ov, ok) {
				return _.endsWith(iv, ok);
			});
			step.inputs[ik]=output ? output : iv[0];
		})
		return step;
	},

	handleSelectAll: function() {
		JobsActions.addWorkflowBuilderJobIndex();
	},

	handleReset: function() {
		JobsActions.removeWorkflowBuilderJobIndex();
		this.setState({wfid: undefined});
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
			placeholder: 'Enter workflow name',
			value: this.state.formData['workflowName'] !== undefined ? this.state.formData['workflowName'] : 'my_workflow',
			type: 'text'
		};
		let descInput={
			name: 'workflowDesc',
			label: 'Workflow Description',
			required: false,
			placeholder: 'Enter workflow description',
			value: this.state.formData['workflowDesc'] !== undefined ? this.state.formData['workflowDesc'] : '',
			type: 'textarea',
			rows: 3
		};

		let markup=(
			<div>
				<form ref={this.formName} >
					<BaseInput data={jobListInput} reload='resubmit' onValidate={true} />
					<BaseInput data={nameInput} onValidate={true} />
					<BaseInput data={descInput} />
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
						<Button
							bsStyle='primary'
							disabled={onSubmit}
							onClick={this.handleSelectAll}>
						Select All
						</Button>
					</ButtonToolbar>
				</form>
				<Dialog ref='dialog' />
			</div>
		);
		return markup;
	}
});

module.exports = WorkflowBuilderForm;
