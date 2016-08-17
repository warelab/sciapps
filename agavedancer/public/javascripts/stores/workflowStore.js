'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsStore from './appsStore.js';
import JobsStore from './jobsStore.js';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';
import WorkflowActions from  '../actions/workflowActions.js';

const WorkflowStore=Reflux.createStore({
	listenables: WorkflowActions,
	
	init: function() {
		this.state={
			workflowDetail: undefined,
			workflowDetailCache: {},
			workflows: {},
			workflowDiagramDef: undefined
		};
		this.listenTo(JobsStore, this.setJobsStore);
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	showWorkflowDiagram: function(workflowDiagramDef) {
		this.state.workflowDiagramDef=workflowDiagramDef;
		this.complete();
	},

	hideWorkflowDiagram: function() {
		this.state.workflowDiagramDef=undefined;
		this.complete();
	},

	showWorkflow: function(wfId) {
		this.setWorkflow(wfId);
		this.complete();
	},

	hideWorkflow: function() {
		this.state.workflowDetail=undefined;
		this.complete();
	},

	setWorkflow: function(wfId) {
		let workflowDetail=this.state.workflowDetailCache[wfId];
		let workflowPromise;
		if (workflowDetail) {
			workflowPromise=Q(workflowDetail);

		} else {
			workflowPromise=Q(axios.get('/assets/' + wfId + '.workflow.json'))
			.then(function(res) {
				this.state.workflowDetailCache[wfId]=res.data;
				return res.data;
			}.bind(this));
		}
		workflowPromise.then(function(wfDetail) {
			this.setWorkflowSteps(wfDetail);
		}.bind(this));
		return workflowPromise;
	},

	setJobsStore: function(jobsStore) {
		for (let wid of _.keys(jobsStore.wid)) {
			this._jobsAreReady(wid, jobsStore);
			JobsActions.resetWorkflowJobs(wid);
		}
	},

	setWorkflowSteps: function(wfDetail) {
		this.state.workflowDetail=wfDetail;
		let appIds=_.values(wfDetail.steps).map(function(o) {
			return o.appId;
		});
		let jobIds=_.values(wfDetail.steps).map(function(o) {
			return o.jobId;
		}).filter(function(o){return o});
		AppsActions.setWorkflowApps(appIds, wfDetail.id);
		JobsActions.setJobs(jobIds);
		this.complete();
	},

	buildWorkflow: function(wid, jobIds) {
		if (wid && jobIds && jobIds.length > 0) {
			this.state.workflows[wid]={
				id: wid, 
				jobIds: jobIds,
				jobs: {},
				jobOutputs: {},
				steps: [],
				outputs: {},
				completed: false
			};
			JobsActions.setWorkflowJobOutputs(jobIds, wid);
		} else if (wid) {
			let workflow=this.state.workflows[wid];
			for (let jobId of workflow.jobIds) {
				this._buildWfStep(wid, jobId);
			}
			workflow.completed=true;
			this.complete();
		}
	},

	_jobsAreReady: function(wid, jobsStore) {
		let workflow=this.state.workflows[wid];
		for (let jobId of workflow.jobIds) {
			workflow.jobs[jobId]=jobsStore.jobDetailCache[jobId];
			workflow.jobOutputs[jobId]=jobsStore.jobOutputs[jobId];
		}
		WorkflowActions.buildWorkflow(wid);
	},

	_buildWfStep: function(wid, jobId) {
		let wf=this.state.workflows[wid];
		let sid=_.size(wf.steps);
		let job=wf.jobs[jobId], jobOutputs=wf.jobOutputs[jobId];
		let step={
			id: sid,
			appId: job.appId,
			jobId: job.id,
			inputs: {},
			parameters: job.parameters
		};
		_.forIn(job.inputs, function(iv, ik) {
			let output=_.find(wf.outputs, function(ov, ok) {
				return _.endsWith(iv, ok);
			});
			step.inputs[ik]=output ? output : '';
		}.bind(this));
		for (let output of jobOutputs) {
			wf.outputs[output.path]={step: sid, output_name: output.name};
		}
		wf.steps.push(step);
	},

	submitWorkflow: function(formData) {
		let wf=JSON.parse(formData.get('_workflow_json'));
		JobsActions.submitWorkflowJobs(wf, formData);
	}

});

module.exports = WorkflowStore;
