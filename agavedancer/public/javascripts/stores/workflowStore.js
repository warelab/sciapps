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
			workflowDetail: undefined,
			remoteWorkflowDetailPromise: undefined,
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

	showWorkflow: function(wfId, wfDetail, flag) {
		this.setWorkflow(wfId, wfDetail, flag);
		this.complete();
	},

	hideWorkflow: function() {
		this.state.workflowDetail=undefined;
		this.complete();
	},

	listWorkflow: function() {
		let setting=_config.setting;
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

	setWorkflow: function(wfId, wfDetail, db) {
		let setting=_config.setting;
		if (wfDetail) {
			this.state.workflowDetailCache[wfId]=wfDetail;
		}
		let workflowDetail=this.state.workflowDetailCache[wfId];
		let workflowPromise;
		if (workflowDetail) {
			workflowPromise=Q(workflowDetail);
		} else {
			let url=db ? '/workflow/' + wfId : '/assets/' + wfId + '.workflow.json'; 
			workflowPromise=Q(axios.get(url, {
				headers: {'X-Requested-With': 'XMLHttpRequest'}
			}))
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
				if (v.jobId === undefined && jobs[i].id) {
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
	},

	buildWorkflowDiagramDef: function(appsStore, jobsStore, workflowDirection) {
		let that=this;
		let setting=_config.setting;
		let jobs=jobsStore.workflow.jobs;
		let workflowDetail=this.state.workflowDetail;
		let diagramDefStmts=workflowDirection > 0 ? ['graph TD'] : ['graph LR'];
		if (workflowDetail) {
			let steps=workflowDetail.steps;
			steps.map(function(step, i) {
				let appId=step.appId;
				let appDetail=appsStore.appDetailCache[appId];
				let jobDetail=step.jobId ? jobsStore.jobDetailCache[step.jobId] || _.find(jobsStore.jobDetailCache, 'id', step.jobId) : undefined;
				let showAppId=appId.replace(/\-[\.\d]+$/, '');
				let appClass='PENDING';
				if (jobDetail) {
					appClass=jobDetail.status;
				}
				if (! _.includes(['PENDING', 'FINISHED', 'FAILED'], appClass)) {
					appClass='RUNNING';
				}
				let appNodeId=(setting.wf_step_prefix + step.id).replace(/\W/g, '_').toLowerCase();
				diagramDefStmts.push(appNodeId + '[' + that.truncate(showAppId) + ']; class ' + appNodeId + ' appsNode' + appClass);
				diagramDefStmts.push('click ' + appNodeId + ' "' + appDetail.helpURI +'" "' + appDetail.longDescription + '"');
				_.forEach(appDetail.outputs, function(v) {
					let value=v.value.default;
					let output_name, url;
					if (jobDetail) {
						output_name=jobDetail.id;
						if (jobDetail.archive) {
							url=[jobDetail.archiveSystem, jobDetail.archivePath, value].join('/');
						} else if (jobDetail.outputPath) {
							url=[setting.archive_system, jobDetail.outputPath.replace(jobDetail.owner, setting.archive_path), value].join('/');
						}
					} else {
						output_name=setting.wf_step_prefix + step.id + ':';
					}
					output_name=['file', output_name, value].join('_');
					output_name=output_name.replace(/\W/g, '_').toLowerCase();
					diagramDefStmts.push(output_name + '(' + that.truncate(value) + '); class ' + output_name + ' fileNode');
					if (url) {
						//JobsActions.setFile(output_name, url);
						//diagramDefStmts.push('click ' + output_name + ' clickFileNode');
						let splitUrl=url.split('/', 2);
						let href=setting.output_url[splitUrl[0]];
						if (href) {
							href=href.replace(/__system__/, splitUrl[0]);
							href=href.replace(/__path__/, splitUrl[1]);
							diagramDefStmts.push('click ' + output_name + ' "' + href + '" "' + value + '"');
						} else {
							diagramDefStmts.push('click ' + output_name + ' clickFileNode "' + value + '"');
						}
					}
					diagramDefStmts.push(appNodeId + '-->' + output_name);
				});
				_.forEach(appDetail.inputs, function(v) {
					let value=v.value.default;
					let ic=step.inputs[v.id];
					if (_.isPlainObject(ic)) {
						let prevAppNodeId=(setting.wf_step_prefix + ic.step).replace(/\W/g, '_').toLowerCase();
						let prevJobId=steps[ic.step].jobId;
						let prevJobDetail=prevJobId ? jobsStore.jobDetailCache[prevJobId] || _.find(jobsStore.jobDetailCache, 'id', prevJobId) : undefined;
						let input_name;
						if (prevJobDetail) {
							//input_name=prevJobDetail.archive ? prevJobDetail.archiveSystem + '/' + prevJobDetail.archivePath + '/' : setting.archive_system + '/' + prevJobDetail.outputPath.replace(prevJobDetail.owner, setting.archive_path) + '/';
							input_name=prevJobDetail.id;
						} else {
							input_name=setting.wf_step_prefix + ic.step + ':';
						}
						input_name=['file', input_name, ic.output_name].join('_');
						//let url=input_name; 
						input_name=input_name.replace(/\W/g, '_').toLowerCase();
						//diagramDefStmts.push(value + '(' + that.truncate(ic.output_name) + '); class ' + value + ' fileNode');
						//if (prevJobDetail) {
							//diagramDefStmts.push('click ' + input_name + ' clickFileNode');
						//}
						//diagramDefStmts.push(prevAppNodeId + '-->' + input_name);
						diagramDefStmts.push(input_name + '-->' + appNodeId);
					} else if (ic) {
						value=_.last(ic.split('/'));
						let url=ic.replace('agave://', '');
						let input_name=url.replace(/\W/g, '_').toLowerCase();
						diagramDefStmts.push(input_name + '(' + that.truncate(value) + '); class ' + input_name + ' fileNode');
						diagramDefStmts.push('click ' + input_name + ' clickFileNode "' + value + '"');
						diagramDefStmts.push(input_name + '-->' + appNodeId);
						JobsActions.setFile(input_name, url);
					}
				});
			});
			this.state.workflowDiagramDef=_.uniq(diagramDefStmts).join(';\n');
			this.complete();
		}
	}


});

module.exports = WorkflowStore;
