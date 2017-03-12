'use strict';

import Reflux from 'reflux';
import axios from 'axios';
import _ from 'lodash';
import Q from 'q';
import JobsActions from  '../actions/jobsActions.js';
import AppsActions from  '../actions/appsActions.js';
import WorkflowActions from  '../actions/workflowActions.js';

const JobsStore=Reflux.createStore({
	listenables: JobsActions,

	init: function() {
		this.state={
			setting: _config.setting,
			resubmit: false,
			showJob: false,
			showJobId: undefined,
			jobs: [],
			workflowBuilderJobIndex: [],
			jobDetail: {},
			jobStatus: {},
			jobOutputs: {},
			jobDetailCache: {},
			wid: {},
			fileDetailCache: {},
			workflow: {}
		};
	},

	getInitialState: function() {
		return this.state;
	},

	complete: function() {
		this.trigger(this.state);
	},

	_reset: function() {
		this.state.showJobId=undefined;
		this.state.jobs=[];
		this.state.workflowBuilderJobIndex=[];
		this.state.jobDetail={};
		this.state.jobStatus={};
		this.state.jobOutputs={};
		this.state.jobDetailCache={};
		this.state.wid={};
		this.state.fileDetailCache={};
		this.state.workflow={};
	},

	resetJobs: function() {
		this._reset();
		this.complete();
	},

	submitWorkflowJobs: function(wf, formData) {
		let submitNumber=this.state.jobs.length;
		let setting=this.state.setting;
		wf.steps.map(function(step, i) {
			this.state.jobs[submitNumber + i]={appId: step.appId};
		}.bind(this));
		this.state.workflow={};
		this.complete();
		Q(axios.post(setting.host_url + '/workflow/new', formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				return;
			}
			let jobs=[];
			wf.steps.map(function(step, i) {
				let index=submitNumber + i;
				let job=res.data.jobs[i];
				this.state.jobs[index]=job;
				this.state.jobStatus[job.job_id]=job.status;
				jobs[i]=job.job_id;
			}.bind(this));
			this.state.workflow={
				id: res.data.workflow_id,
				workflowDetail: res.data.workflow,
				jobs: jobs,
				steps: []
			};
			WorkflowActions.setWorkflow(res.data.workflow_id, res.data.workflow);
			this.complete();
		}.bind(this))
		.catch(function(error) {
				console.log(error);
		})
		.done();
	},

	submitJob: function(appId, formData) {
		let submitNumber=this.state.jobs.length;
		let setting=this.state.setting;
		this.state.jobs[submitNumber]={appId: appId};
		this.complete();
		Q(axios.post(setting.host_url + '/job/new/' + appId , formData, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			transformRequest: function(data) { return data; }
		}))
		.then(function(res) {
			if (res.data.error) {
				return;
			}
			let job=res.data;
			this.state.jobs[submitNumber]=job;
			this.state.jobStatus[job.job_id]=job.status;
			this.complete();
		}.bind(this))
		.catch(function(error) {
				console.log(error);
		})
		.done();
	},

	setJobs: function(jobIds) {
		let submitNumber=this.state.jobs.length;
		let currentJobIds={};
		this.state.jobs.forEach(function(job) {
			currentJobIds[job.job_id]=true;
		});

		Q.all(jobIds.map(this.setJob)).done(function(jobs) {
			_.forEach(jobs, function(job) {
				if (job && ! currentJobIds[job.job_id]) {
					this.state.jobs[submitNumber++]=this.state.jobDetailCache[job.job_id];
				}
			}.bind(this));
			this.complete();
		}.bind(this));
	},

	setWorkflowJobs: function(jobIds, wid) {
		Q.all(jobIds.map(this.setJob)).done(function(jobs) {
			if (wid !== undefined) {
				this.state.wid[wid]=true;
				this.complete();
				WorkflowActions.workflowJobsReady(wid, this.state.jobDetailCache, this.state.jobOutputs);
			}
		}.bind(this));
	},

	resetWorkflowJobs: function(wid) {
		delete this.state.wid[wid];
	},

	setJob: function(jobId) {
		let jobDetail=this.state.jobDetailCache[jobId];
		let setting=this.state.setting;
		let jobPromise;
		if (jobDetail && _.includes(['FINISHED','FAILED'], jobDetail.status)) {
			jobPromise=Q(jobDetail);
		} else {
			jobPromise=Q(axios.get(setting.host_url + '/job/' + jobId, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			}))
			.then(function(res) {
				if (res.data.error) {
					return;
				}
				this.state.jobDetailCache[res.data.job_id]=res.data;
				return res.data;
			}.bind(this));
		}
		return jobPromise;
	},

	showJob: function(jobId) {
		if (! this.state.showJob) {
			this.state.showJob=true;
			this.complete();
		}
		let jobPromise=this.setJob(jobId);
		jobPromise.then(function(jobDetail) {
			this.state.showJobId=jobId;
			this.state.jobDetailCache[jobId]=jobDetail;
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	hideJob: function() {
		if (this.state.showJob) {
			this.state.showJobId=undefined;
			this.state.showJob=false;
			this.complete();
		}
	},

	setWorkflowJobOutputs: function(wid) {
		let jobIds=this.state.workflowBuilderJobIndex.map(function(v, i) {
			return v ? this.state.jobs[i].job_id : undefined;
		}.bind(this)).filter(function(v) {return v !== undefined});
		Q.all(jobIds.map(this.setJobOutputs)).done(function(jobOutputs) {
			if (wid !== undefined) {
				this.state.wid[wid]=true;
				WorkflowActions.workflowJobsReady(wid, jobIds, this.state.jobDetailCache, this.state.jobOutputs);
			}
			this.complete();
		}.bind(this));
	},

	setJobOutputs: function(jobId) {
		let jobOutputs=this.state.jobOutputs[jobId];
		let setting=_config.setting;
		let jobOutputsPromise;
		if (jobOutputs) {
			jobOutputsPromise=Q(jobOutputs);
		} else {
			let jobPromise=this.setJob(jobId);
			jobOutputsPromise=jobPromise.then(function(jobDetail) {
				let path='system/' + jobDetail.archiveSystem + '/' + jobDetail.archivePath;
				return Q(axios.get(setting.host_url + '/browse/' + path, {
					headers: {'X-Requested-With': 'XMLHttpRequest'},
				}))
			})
			.then(function(res) {
				if (res.data.error) {
					return;
				}
				let results=res.data[0].list.filter(function(result) {
					return ! result.name.startsWith('.');
				});
				for (let r of results) {
					r.path=r.path.replace(setting.archive_home + '/', '');
				}
				return results;
			})
			.then(function(results) {
				if (results) {
					this.state.jobOutputs[jobId]=results;
					return results;
				} else {
					return;
				}
			}.bind(this));
		}
		return jobOutputsPromise;
	},

	showJobOutputs: function(jobId) {
		let jobOutputsPromise=this.setJobOutputs(jobId);
		jobOutputsPromise.then(function() {
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	setFile: function(fileId, url) {
		let setting=this.state.setting;
		let path=url.replace('agave://', '');
		let fileDetail=this.state.fileDetailCache[fileId];
		let filePromise;
		if (fileDetail) {
			filePromise=Q(fileDetail);
		} else {
			filePromise=Q(axios.get(setting.host_url + '/file/' + path, {
				headers: {'X-Requested-With': 'XMLHttpRequest'},
			}))
			.then(function(res) {
				return res.data;
			}.bind(this))
		}
		filePromise.then(function(data) {
			if (! fileDetail && data.system) {
				this.state.fileDetailCache[fileId]=data;
			}
		}.bind(this))
		return filePromise;
	},

	checkWorkflowJobStatus: function(wfId) {
		let setting=this.state.setting;
		let jobStatusPromise=Q(axios.get(setting.host_url + '/workflow/status/' + wfId, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		}))
		.then(function(res) {
			_.forEach(res.data, function(v) {
				this.state.jobStatus[v.job_id]=v.status;
			}.bind(this));
			console.log(this.state.jobStatus);
			this.complete();
			return res.data;
		}.bind(this));
		return jobStatusPromise;
	},

	checkJobStatus: function(jobIds) {
		let setting=this.state.setting;
		let query=jobIds.map(function(jobId) {
			return('id=' + jobId); 
		}).join('&');
		let jobStatusPromise=Q(axios.get(setting.host_url + '/job/status/?' + query, {
			headers: {'X-Requested-With': 'XMLHttpRequest'},
		}))
		.then(function(res) {
			_.forEach(res.data, function(v) {
				this.state.jobStatus[v.job_id]=v.status;
			}.bind(this));
			console.log(this.state.jobStatus);
			this.complete();
			return res.data;
		}.bind(this));
		return jobStatusPromise;
	},

	resubmitJob: function(jobId) {
		this.state.resubmit=true;
		let jobPromise=this.setJob(jobId);
		jobPromise.then(function(jobDetail) {
			this.state.jobDetail=jobDetail;
			AppsActions.showAppByJob(this.state);
			this.complete();
		}.bind(this))
		.catch(function(error) {
			console.log(error);
		})
		.done();
	},

	resetResubmit: function() {
		this.state.resubmit=false;
		this.complete();
	},

	addWorkflowBuilderJobIndex: function(index) {
		this.state.workflowBuilderJobIndex[index]=true;
		this.complete();
	},

	removeWorkflowBuilderJobIndex: function(index) {
		if (index !== undefined) {
			delete this.state.workflowBuilderJobIndex[index];
		} else {
			this.state.workflowBuilderJobIndex=[];
		}
		this.complete();
	}
});

module.exports = JobsStore;
