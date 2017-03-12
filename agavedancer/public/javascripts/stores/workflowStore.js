'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';
import WorkflowActions from  '../actions/workflowActions.js';

const WorkflowStore=Reflux.createStore({
	listenables: WorkflowActions,
	
	init: function() {
		this.state={
			setting: _config.setting,
			showWorkflowDiagram: false,
			showWorkflowLoadBox: false,
			workflowDetail: undefined,
			workflowDetailCache: {},
			build: {},
			workflowDiagramDef: undefined
		};
		//this.listenTo(JobsStore, this.setJobsStore);
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	showNode: function() {
		this.complete();
	},
	
	showWorkflowLoadBox: function() {
		this.state.showWorkflowLoadBox=true;
		this.complete();
	},

	hideWorkflowLoadBox: function() {
		this.state.showWorkflowLoadBox=false;
		this.complete();
	},

	showWorkflowDiagram: function() {
		this.state.showWorkflowDiagram=true;
		this.complete();
	},

	hideWorkflowDiagram: function() {
		this.state.showWorkflowDiagram=false;
		JobsActions.hideFile();
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

	setWorkflow: function(wfId, wfDetail) {
		if (wfDetail) {
			this.state.workflowDetailCache[wfId]=wfDetail;
		}
		let workflowDetail=this.state.workflowDetailCache[wfId];
		let setting=this.state.setting;
		let workflowPromise;
		if (workflowDetail) {
			workflowPromise=Q(workflowDetail);

		} else {
			workflowPromise=Q(axios.get('/assets/' + wfId + '.workflow.json'))
			.then(function(res) {
				if (res.data.error) {
					return;
				}
				this.state.workflowDetailCache[wfId]=res.data;
				return res.data;
			}.bind(this));
		}
		workflowPromise.then(function(wfDetail) {
			if (wfDetail) {
				this.setWorkflowSteps(wfDetail);
			}
		}.bind(this));
		return workflowPromise;
	},

	workflowJobsReady: function(wid, jobIds, jobDetailCache, jobOutputs) {
		this._workflowJobsReady(wid, jobIds, jobDetailCache, jobOutputs);
		JobsActions.resetWorkflowJobs(wid);
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

	buildWorkflow: function(wid, wfName, wfDesc) {
		if (wid && wfName) {
			this.state.build[wid]={
				id: wid, 
				name: wfName,
				description: wfDesc || '',
				jobIds: [],
				jobs: {},
				jobOutputs: {},
				steps: [],
				outputs: {},
				completed: false
			};
			JobsActions.setWorkflowJobOutputs(wid);
		} else if (wid) {
			let workflow=this.state.build[wid];
			for (let jobId of workflow.jobIds) {
				this._buildWfStep(wid, jobId);
			}
			workflow.completed=true;
			this.state.workflowDetailCache[workflow.id]=workflow;
			this.complete();
		}
	},

	_workflowJobsReady: function(wid, jobIds, jobDetailCache, jobOutputs) {
		let workflow=this.state.build[wid];
		workflow.jobIds=jobIds;
		for (let jobId of workflow.jobIds) {
			workflow.jobs[jobId]=jobDetailCache[jobId];
			workflow.jobOutputs[jobId]=jobOutputs[jobId];
		}
		WorkflowActions.buildWorkflow(wid);
	},

	_buildWfStep: function(wid, jobId) {
		let wf=this.state.build[wid];
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
			step.inputs[ik]=output ? output : iv[0];
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
