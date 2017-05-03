'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';
import WorkflowActions from  '../actions/workflowActions.js';

axios.defaults.withCredentials = true;

const WorkflowStore=Reflux.createStore({
	listenables: WorkflowActions,
	
	init: function() {
		this._resetState();
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	resetState: function() {
		this._resetState();
		this.complete();
	},

	_resetState: function() {
		this.state={
			showWorkflowDiagram: false,
			showWorkflowLoadBox: false,
			workflowDetail: undefined,
			workflowDetailCache: {},
			workflows: [],
			build: {},
			workflowDiagramDef: undefined
		};
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
		if (this.state.workflowDetail !== undefined) {
			this.state.showWorkflowDiagram=true;
			this.complete();
		}
	},

	hideWorkflowDiagram: function() {
		this.state.showWorkflowDiagram=false;
		JobsActions.hideFile();
		this.complete();
	},

	showWorkflow: function(wfId, wfDetail) {
		this.setWorkflow(wfId, wfDetail);
		this.complete();
	},

	hideWorkflow: function() {
		this.state.workflowDetail=undefined;
		this.complete();
	},

	listWorkflow: function() {
		let setting=_config.setting;
		//Q(axios.get(setting.host_url + '/workflow', {
		Q(axios.get('/workflow', {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			}
			this.state.workflows=res.data;
			this.complete();
			return res.data;
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	setWorkflow: function(wfId, wfDetail) {
		let setting=_config.setting;
		if (wfDetail) {
			this.state.workflowDetailCache[wfId]=wfDetail;
		}
		let workflowDetail=this.state.workflowDetailCache[wfId];
		let workflowPromise;
		if (workflowDetail) {
			workflowPromise=Q(workflowDetail);
		} else {
			workflowPromise=Q(axios.get('/assets/' + wfId + '.workflow.json'))
			.then(function(res) {
				if (res.data.error) {
					console.log(res.data.error);
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
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		});
		return workflowPromise;
	},

	updateWorkflow: function(wf) {
		let formData=new FormData();
		formData.append('_workflow_name',  wf.name);
		formData.append('_workflow_desc',  wf.description);
		Q(axios.post('/workflow/' + wf.id + '/update', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else if (res.data.status === 'success') {
				let currWf=_.find(this.state.workflows, 'workflow_id', wf.id);
				_.assign(currWf, wf);
				this.complete();
			}
		}.bind(this))
		.catch(function(error) {
				console.log(error);
		})
		.done();
	},

	saveWorkflow: function(wf) {
		let setting=_config.setting;
		let formData=new FormData();
		formData.append('_workflow_id', wf.id);
		formData.append('_workflow_name',  wf.name);
		formData.append('_workflow_desc',  wf.description);
		formData.append('_workflow_json',  JSON.stringify(wf));

		//Q(axios.post(setting.host_url + '/workflow/new', formData, {
		Q(axios.post('/workflow/new', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else if (res.data.status === 'success') {
				this.state.workflows.push(res.data.data);
				this.complete();
			}
		}.bind(this))
		.catch(function(error) {
				console.log(error);
		})
		.done();
	},

	deleteWorkflow: function(wfId) {
		let setting=_config.setting;
		//Q(axios.get(setting.host_url + '/workflow/' + wfId + '/delete', {
		Q(axios.get('/workflow/' + wfId + '/delete', {
			headers: {'X-Requested-With': 'XMLHttpRequest'}
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else if (res.data.status === 'success') {
				_.remove(this.state.workflows, {workflow_id: wfId});
				this.complete();
			}
		}.bind(this))
		.catch(function(error) {
				console.log(error);
		})
		.done();
	},

	workflowJobsReady: function(wfId, jobIds, jobDetailCache, jobOutputs) {
		this._workflowJobsReady(wfId, jobIds, jobDetailCache, jobOutputs);
		JobsActions.resetWorkflowJobs(wfId);
	},

	updateWorkflowJob: function(wfId) {
	},

	setWorkflowSteps: function(wfDetail) {
		this.state.workflowDetail=wfDetail;
		let appIds=_.uniq(_.values(wfDetail.steps).map(function(o) {
			return o.appId;
		}));
		let jobIds=_.uniq(_.values(wfDetail.steps).map(function(o) {
			return o.jobId;
		}).filter(function(o){return o}));
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
