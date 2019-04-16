'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import AppsActions from  '../actions/appsActions.js';
import JobsActions from  '../actions/jobsActions.js';
import WorkflowActions from  '../actions/workflowActions.js';
import utilities from '../libs/utilities.js';

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
      showWorkflowMetadata: false,
			workflowDetail: undefined,
			remoteWorkflowDetailPromise: undefined,
			workflowDetailCache: {},
			workflows: [],
      metadata: {},
      dataItem: undefined,
      dataWorkflows: {},
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

	showWorkflowDiagram: function(wfId, wfDetail) {
		this.state.showWorkflowDiagram=true;
		this.showWorkflow(wfId, wfDetail);
		this.complete();
	},

	hideWorkflowDiagram: function() {
		this.state.showWorkflowDiagram=false;
		JobsActions.hideFile();
		this.complete();
	},

	showWorkflowMetadata: function(wfId) {
		this.state.showWorkflowMetadata=true;
		this.setWorkflow(wfId, undefined, undefined, undefined, true);
		this.complete();
	},

	hideWorkflowMetadata: function() {
		this.state.showWorkflowMetadata=false;
		this.complete();
	},

	showWorkflow: function(wfId, wfDetail, noJobList) {
		let promise=Q(1);
		if (wfId) {
			this.state.workflowDetail=undefined;
			promise=this.setWorkflow(wfId, wfDetail, undefined, undefined, noJobList);
		} 
		promise.then(function(wf) {
			if (this.state.workflowDetail !== undefined) {
				this.complete();
			}
		}.bind(this));
	},

	hideWorkflow: function() {
		this.state.workflowDetail=undefined;
		this.complete();
	},

	listWorkflow: function(dataItem) {
    this.state.dataItem=dataItem;
    this.complete();
		let setting=_config.setting;
    let option=dataItem ? "?dataItem=" + dataItem : '';
		Q(axios.get('/workflow' + option, {
			headers: {'X-Requested-With': 'XMLHttpRequest'}
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else {
        if (dataItem) {
          this.state.dataWorkflows[dataItem]=res.data.data;
        } else {
				  this.state.workflows=res.data.data;
        }
				this.complete();
				return res.data;
			}
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	setWorkflow: function(wfId, wfDetail, addToList, noSync, noJobList) {
		let setting=_config.setting;
		if (wfDetail) {
			this.state.workflowDetailCache[wfId]=wfDetail;
			let index=_.findIndex(this.state.workflows, {workflow_id: wfId});
			if (index >= 0) {
				this.state.workflows[index]=wfDetail;
			} else if (addToList) {
				this.state.workflows.push(wfDetail);
			}
		}
		let workflowDetail=this.state.workflowDetailCache[wfId];
		let workflowPromise;
		if (workflowDetail) {
			workflowPromise=Q(workflowDetail);
		} else {
			//workflowPromise=Q(axios.get('/assets/' + wfId + '.workflow.json'))
			workflowPromise=Q(axios.get('/workflow/' + wfId,{
				headers: {'X-Requested-With': 'XMLHttpRequest'}
			}))
			.then(function(res) {
				if (res.data.error) {
					console.log(res.data.error);
					return;
				} else {
					let data=res.data.data || res.data;
					this.state.workflowDetailCache[wfId]=data;
					return data;
				}
			}.bind(this));
		}
		return workflowPromise.then(function(wfDetail) {
			if (wfDetail) {
				this.setWorkflowSteps(wfDetail, noSync, noJobList);
        if (wfDetail.metadata_id) {
          this.setWorkflowMetadata(wfDetail.workflow_id);
        }
				return wfDetail;
			}
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		});
	},

	updateWorkflow: function(wf) {
		let formData=new FormData();
		formData.append('workflow_name',  wf.name);
		formData.append('workflow_desc',  wf.description);
		Q(axios.post('/workflow/' + wf.workflow_id + '/update', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else if (res.data.status === 'success') {
				let currWf=_.find(this.state.workflows, 'workflow_id', wf.workflow_id);
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
		formData.append('id', wf.workflow_id);
		formData.append('workflow_name',  wf.name);
		formData.append('workflow_desc',  wf.description);
		formData.append('workflow_json',  JSON.stringify(wf));

		Q(axios.post('/workflow/new', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				console.log(res.data.error);
				return;
			} else if (res.data.status === 'success') {
				let data=res.data.data;
				WorkflowActions.setWorkflow(data.workflow_id, data, true);
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
				return wfId;
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

	updateWorkflowJob: function(wfId, jobs) {
		if (this.state.workflowDetail.id === wfId) {
			this.state.workflowDetail.steps.forEach(function(v, i) {
				if (jobs[i].id && jobs[i].id !== v.jobId) {
					v.jobId=jobs[i].id;
				}
			});
		}
		this.complete();
	},

	setRemoteWorkflow: function(value, type) {
		let promise;
		if ('json' === type) {
			promise=Q(value);
		} else if ('url' === type) {
			let formData=new FormData();
			formData.append('_url', value);
			promise=Q(axios.post('/workflow/remote', formData, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
				transformRequest: function(data) { return data; }
			}))
			.then(function(res) {
				if (res.data.error) {
					console.log(res.data.error);
					return;
				} else if (res.data.status === 'success') {
					return res.data.data;
				}
			}.bind(this))
			.catch(function(error) {
				console.log(error);
			})
		}
		this.state.remoteWorkflowPromise=promise;
		return promise;
	},

	loadRemoteWorkflow: function() {
		if (this.state.remoteWorkflowPromise) {
			let promise=this.state.remoteWorkflowPromise;
			promise.then(function(json) {
				let wfDetail=JSON.parse(json);
				this.setWorkflowSteps(wfDetail);
				return wfDetail;
			}.bind(this))
			.done();
		}
	},

  setWorkflowMetadata : function(wfId) {
		let promise;
    if (this.state.metadata[wfId]) {
      promise=Q(this.state.metadata[wfId]);
    } else {
      promise=Q(axios.get('/workflow/' + wfId + '/metadata', {
		    headers: {'X-Requested-With': 'XMLHttpRequest'}
		  }))
		  .then(function(res) {
			  if (res.data.error) {
				  console.log(res.data.error);
				  return;
			  } else if (res.data.status === 'success') {
          this.state.metadata[wfId]=res.data.data;
				  return res.data.data;
			  }
		  }.bind(this))
		  .catch(function(error) {
			  console.log(error);
		  });
    }
    promise.then(function(metadata) {
      this.complete();
      return metadata;
    }.bind(this));
  },

	setWorkflowSteps: function(wfDetail, noSync, noJobList) {
		if (! noSync || this.state.workflowDetail && this.state.workflowDetail.workflow_id === wfDetail.workflow_id) {
			this.state.workflowDetail=wfDetail;
		}
		let appIds=_.uniq(_.values(wfDetail.steps).map(function(o) {
			return o.appId;
		}));
		let jobIds=_.uniq(_.values(wfDetail.steps).map(function(o) {
			return o.jobId;
		}).filter(function(o){return o}));
		AppsActions.setApps(appIds, wfDetail.workflow_id);
		JobsActions.setJobs(jobIds, undefined, noJobList);
		//this.complete();
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
